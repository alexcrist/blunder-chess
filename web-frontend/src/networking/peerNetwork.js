import _ from "lodash";
import { Peer } from "peerjs";

const SERVER_IP = "beardom.uw.r.appspot.com";
const SERVER_PORT = 443;
const SERVER_KEY = "beardom";
const APPLICATION_ID = "blunder-chess";
export const PEER_DISCONNECT_MESSAGE_TYPE = "disconnect";
const HEALTH_CHECK_MESSAGE_TYPE = "healthcheck";
const HEALTH_CHECK_FREQ_MS = 1000;
const HEALTH_CHECK_TIMEOUT_MS = 4000;

let id = null;
let peerConnections = {};
let peerLastSeens = {};
let messageHandlers = {};

const onConnectToNetwork = (resolve, network) => async (_id) => {
    id = _id;
    console.info(`Connected to PeerJS network with ID: ${id}`);
    const res = await fetch(`https://${SERVER_IP}/${SERVER_KEY}/peers`);
    const peerIds = await res.json();
    for (const peerId of peerIds) {
        const isSelf = peerId === id;
        if (!isSelf) {
            const connection = network.connect(peerId, {
                metadata: { appId: APPLICATION_ID },
            });
            await initPeerConnection(connection);
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
            if (message.type === HEALTH_CHECK_MESSAGE_TYPE) {
                peerLastSeens[peerId] = Date.now();
            } else {
                handleMessage(message, peerId);
            }
        });
        connection.on("open", () => {
            peerConnections[peerId] = connection;
            peerLastSeens[peerId] = Date.now();
            healthcheckInterval = setInterval(() => {
                connection.send({ type: HEALTH_CHECK_MESSAGE_TYPE });
                const elapsedMs = Date.now() - peerLastSeens[peerId];
                if (elapsedMs > HEALTH_CHECK_TIMEOUT_MS) {
                    connection.close();
                }
            }, HEALTH_CHECK_FREQ_MS);
            resolve();
        });
        connection.on("close", () => {
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
        connection.send(message);
    } else {
        console.warn(
            `Could not send message to peer because connection is closed (peer ID = ${peerId})`,
        );
    }
};

export const addPeerMessageHandler = (messageType, handlerFn) => {
    const handlerId = Math.random().toString();
    messageHandlers[handlerId] = (message, peerId) => {
        if (message.type === messageType) {
            handlerFn(message, peerId);
        }
    };
    return () => delete messageHandlers[handlerId];
};

const handleMessage = (message, peerId) => {
    const handlerFns = Object.values(messageHandlers);
    for (const handlerFn of handlerFns) {
        handlerFn(_.cloneDeep(message), peerId);
    }
};
