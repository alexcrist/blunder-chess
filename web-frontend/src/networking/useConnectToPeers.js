import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mainSlice from "../main/mainSlice";
import { useNavigateToGameOnline } from "../main/useNavigation";
import {
    addNetworkMessageHandler,
    addOnConnectToPeerHandler,
    PEER_DISCONNECT_MESSAGE_TYPE,
    sendMessageToPeer,
    sendMessageToPeers,
} from "./peerNetwork";

const SEARCH_REQUEST = "SEARCH_REQUEST";
const SEARCH_CONFIRM = "SEARCH_CONFIRM";
const SEARCH_CANCEL = "SEARCH_CANCEL";

const MATCH_REQUEST = "MATCH_REQUEST";
const MATCH_ACCEPT = "MATCH_ACCEPT";
const MATCH_REJECT = "MATCH_REJECT";

const PEER_NAME_CHANGE = "PEER_NAME_CHANGE";

const REQUEST_COOLDOWN_MS = 5000;

export const useConnectToPeers = () => {
    const name = useSelector((state) => state.main.name);

    // Peers' players
    const [players, setPlayers] = useState([]);
    const addPlayer = useCallback(
        (player) => {
            const existing = _.find(players, { peerId: player.peerId });
            if (!existing) {
                const newPlayers = [...players, player];
                setPlayers(newPlayers);
            }
        },
        [players],
    );
    const removePlayer = useCallback(
        (peerId) => {
            const newPlayers = players.filter(
                (player) => peerId !== player.peerId,
            );
            setPlayers(newPlayers);
        },
        [players],
    );
    const updatePlayer = useCallback(
        (peerId, update) => {
            const newPlayers = players.map((player) => {
                if (player.peerId === peerId) {
                    return { ...player, ...update };
                }
                return player;
            });
            setPlayers(newPlayers);
        },
        [players],
    );

    // Get player names
    const [peerIdOfOutboundReq, setPeerIdOfOutboundReq] = useState(null);
    const [peerIdOfInboundReq, setPeerIdOfInboundReq] = useState(null);
    const [isHeads, setIsHeads] = useState(false);
    const getIsPlayer1 = useCallback(
        (didSendRequest) => {
            return (didSendRequest && isHeads) || (!didSendRequest && !isHeads);
        },
        [isHeads],
    );

    // Upon confirming match with a peer
    const navigateToGameOnline = useNavigateToGameOnline();
    const onAcceptMatch = useCallback(
        (peerId, didSendRequest) => {
            sendMessageToPeers(SEARCH_CANCEL);
            const peerName = _.find(players, { peerId })?.name;
            const connectedPeer = { peerId, name };
            const isPlayer1 = getIsPlayer1(didSendRequest);
            const [player1Name, player2Name] = isPlayer1
                ? [name, peerName]
                : [peerName, name];
            navigateToGameOnline({
                connectedPeer,
                isPlayer1,
                player1Name,
                player2Name,
            });
        },
        [getIsPlayer1, name, navigateToGameOnline, players],
    );

    // Upon rejecting match with a peer
    const onRejectMatch = useCallback(
        (peerId) => {
            if (peerIdOfOutboundReq === peerId) {
                setPeerIdOfOutboundReq(null);
            }
            if (peerIdOfInboundReq === peerId) {
                setPeerIdOfInboundReq(null);
            }
        },
        [peerIdOfInboundReq, peerIdOfOutboundReq],
    );

    // Match with other player
    const dispatch = useDispatch();
    const requestMatch = useCallback(
        (peerId) => {
            setPeerIdOfInboundReq(null);
            setPeerIdOfOutboundReq(peerId);
            const isHeads = Math.random() > 0.5;
            setIsHeads(isHeads);
            sendMessageToPeer(peerId, MATCH_REQUEST, { isHeads, name });
            dispatch(mainSlice.actions.setIsOnRequestCooldown(true));
            setTimeout(() => {
                dispatch(mainSlice.actions.setIsOnRequestCooldown(false));
            }, REQUEST_COOLDOWN_MS);
        },
        [dispatch, name],
    );
    const acceptMatch = useCallback(
        (peerId) => {
            onAcceptMatch(peerId, false);
            sendMessageToPeer(peerId, MATCH_ACCEPT);
        },
        [onAcceptMatch],
    );
    const rejectMatch = useCallback(
        (peerId) => {
            onRejectMatch(peerId);
            sendMessageToPeer(peerId, MATCH_REJECT);
        },
        [onRejectMatch],
    );

    // Handle messages from peers
    useEffect(() => {
        const handlers = {
            [SEARCH_REQUEST]: (message, peerId) => {
                const player = {
                    peerId,
                    name: message.payload.name,
                };
                addPlayer(player);
                sendMessageToPeer(peerId, SEARCH_CONFIRM, { name });
            },
            [SEARCH_CONFIRM]: (message, peerId) => {
                const player = {
                    peerId: peerId,
                    name: message.payload.name,
                };
                addPlayer(player);
            },
            [PEER_DISCONNECT_MESSAGE_TYPE]: (message, peerId) => {
                removePlayer(peerId);
            },
            [MATCH_REQUEST]: (message, peerId) => {
                const isBusy = peerIdOfOutboundReq || peerIdOfInboundReq;
                if (isBusy) {
                    sendMessageToPeer(peerId, MATCH_REJECT);
                } else {
                    const player = {
                        peerId: peerId,
                        name: message.payload.name,
                    };
                    addPlayer(player);
                    setPeerIdOfInboundReq(peerId);
                    setIsHeads(message.payload.isHeads);
                }
            },
            [MATCH_ACCEPT]: (message, peerId) => {
                onAcceptMatch(peerId, true);
            },
            [MATCH_REJECT]: (message, peerId) => {
                onRejectMatch(peerId);
            },
            [PEER_NAME_CHANGE]: (message, peerId) => {
                updatePlayer(peerId, { name: message.payload.name });
            },
            [SEARCH_CANCEL]: (message, peerId) => {
                removePlayer(peerId);
            },
        };
        const cleanUpFns = Object.entries(handlers).map(
            ([messageType, handlerFn]) => {
                return addNetworkMessageHandler(messageType, handlerFn);
            },
        );
        return () => cleanUpFns.forEach((cleanUpFn) => cleanUpFn());
    }, [
        addPlayer,
        name,
        onAcceptMatch,
        onRejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
        removePlayer,
        updatePlayer,
    ]);

    // Send search request to peers
    useEffect(() => {
        sendMessageToPeers(SEARCH_REQUEST, { name });
        return addOnConnectToPeerHandler((peerId) => {
            sendMessageToPeer(peerId, SEARCH_REQUEST, { name });
        });
    }, [name]);

    // Broadcast a name change
    const broadcastNameChange = useCallback((name) => {
        sendMessageToPeers(PEER_NAME_CHANGE, { name });
    }, []);

    return {
        players,
        requestMatch,
        acceptMatch,
        rejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
        broadcastNameChange,
    };
};
