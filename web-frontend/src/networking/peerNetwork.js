import _ from "lodash";
import { Peer } from "peerjs";

const SERVER_IP = "server.beardom.net";
const SERVER_PORT = 443;
const SERVER_KEY = "beardom";
const APPLICATION_ID = "blunder-chess";
export const PEER_DISCONNECT_MESSAGE_TYPE = "disconnect";
const HEALTH_CHECK_MESSAGE_TYPE = "healthcheck";
const HEALTH_CHECK_FREQ_MS = 10000;
const HEALTH_CHECK_TIMEOUT_MS = 60000;

let id = null;
let peerConnections = {};
let peerLastSeens = {};
let messageHandlers = {};
let onConnectToPeerHandlers = {};

const onConnectToNetwork = (resolve, network) => async (_id) => {
    id = _id;
    console.info(`Connected to PeerJS network with ID: ${id}`);
    console.log("Fetching peer IDs...");
    console.time("peer-id-fetch");
    const res = await fetch(`https://${SERVER_IP}/${SERVER_KEY}/peers`);
    console.log("Peer IDs fetched.");
    console.timeEnd("peer-id-fetch");
    const peerIds = await res.json();
    for (const peerId of peerIds) {
        const isSelf = peerId === id;
        if (!isSelf) {
            const connection = network.connect(peerId, {
                metadata: { appId: APPLICATION_ID },
            });
            try {
                initPeerConnection(connection);
            } catch (error) {
                console.error(error);
            }
        }
    }
    resolve(network);
};

const initPeerConnection = (connection) => {
    if (connection.metadata?.appId !== APPLICATION_ID) {
        connection.close();
        return;
    }
    return new Promise((resolve) => {
        let healthcheckInterval;
        const peerId = connection.peer;
        connection.on("data", (message) => {
            console.log("Data received", message);
            if (message.type === HEALTH_CHECK_MESSAGE_TYPE) {
                peerLastSeens[peerId] = Date.now();
            } else {
                handleMessage(message, peerId);
            }
        });
        connection.on("open", () => {
            console.log("Connection opened", { peerId });
            peerConnections[peerId] = connection;
            peerLastSeens[peerId] = Date.now();
            for (const handlerFn of Object.values(onConnectToPeerHandlers)) {
                handlerFn(peerId);
            }
            healthcheckInterval = setInterval(() => {
                connection.send({ type: HEALTH_CHECK_MESSAGE_TYPE });
                const elapsedMs = Date.now() - peerLastSeens[peerId];
                if (elapsedMs > HEALTH_CHECK_TIMEOUT_MS) {
                    console.log("DC due to timeout", { peerId });
                    connection.close();
                }
            }, HEALTH_CHECK_FREQ_MS);
            resolve();
        });
        connection.on("close", () => {
            console.log("Connection with peer closed", { peerId });
            clearInterval(healthcheckInterval);
            handleMessage({ type: PEER_DISCONNECT_MESSAGE_TYPE }, peerId);
            delete peerConnections[peerId];
            delete peerLastSeens[peerId];
        });
    });
};

const networkPromise = new Promise((resolve, reject) => {
    new Peer();
    const network = new Peer(null, {
        host: SERVER_IP,
        port: SERVER_PORT,
        key: SERVER_KEY,
        secure: true,
    });
    network.on("open", onConnectToNetwork(resolve, network));
    network.on("connection", initPeerConnection);
    network.on("error", (error) => {
        console.error(error);
        reject(error);
    });
});

export const sendMessageToPeers = async (type, payload) => {
    await networkPromise;
    for (const peerId in peerConnections) {
        await sendMessageToPeer(peerId, type, payload);
    }
};

export const sendMessageToPeer = async (peerId, type, payload) => {
    await networkPromise;
    const connection = peerConnections[peerId];
    if (connection) {
        const message = { type, payload };
        console.log("Sending data", message);
        connection.send(message);
    } else {
        console.warn(
            `Could not send message to peer because connection is closed (peer ID = ${peerId})`,
        );
    }
};

export const addNetworkMessageHandler = (messageType, handlerFn) => {
    const handlerId = Math.random().toString();
    messageHandlers[handlerId] = (message, peerId) => {
        if (message.type === messageType) {
            handlerFn(message, peerId);
        }
    };
    return () => delete messageHandlers[handlerId];
};

export const addOnConnectToPeerHandler = (handlerFn) => {
    const handlerId = Math.random().toString();
    onConnectToPeerHandlers[handlerId] = handlerFn;
    return () => delete onConnectToPeerHandlers[handlerId];
};

export const addPeerMessageHandler = (peerId, messageType, handlerFn) => {
    addNetworkMessageHandler(messageType, (message, somePeerId) => {
        if (somePeerId === peerId) {
            handlerFn(message, peerId);
        }
    });
};

const handleMessage = (message, peerId) => {
    const handlerFns = Object.values(messageHandlers);
    for (const handlerFn of handlerFns) {
        handlerFn(_.cloneDeep(message), peerId);
    }
};

export const disconnectFromPeer = (peerId) => {
    const connection = peerConnections[peerId];
    if (connection) {
        connection.close();
    }
};
