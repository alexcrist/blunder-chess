import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import chessSlice from "../chess/chessSlice";
import mainSlice from "../main/mainSlice";
import {
    addPeerMessageHandler,
    PEER_DISCONNECT_MESSAGE_TYPE,
    sendMessageToPeer,
    sendMessageToPeers,
} from "./peerNetwork";

const DUAL_SCREEN_SEARCH_REQUEST = "DUAL_SCREEN_SEARCH_REQUEST";
const DUAL_SCREEN_SEARCH_CONFIRM = "DUAL_SCREEN_SEARCH_CONFIRM";
const DUAL_SCREEN_SEARCH_CANCEL = "DUAL_SCREEN_SEARCH_CANCEL";

const DUAL_SCREEN_MATCH_REQUEST = "DUAL_SCREEN_MATCH_REQUEST";
const DUAL_SCREEN_MATCH_CONFIRM = "DUAL_SCREEN_MATCH_CONFIRM";
const DUAL_SCREEN_MATCH_REJECT = "DUAL_SCREEN_MATCH_REJECT";

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

    // Get player names
    const [peerIdOfOutboundReq, setPeerIdOfOutboundReq] = useState(null);
    const [peerIdOfInboundReq, setPeerIdOfInboundReq] = useState(null);
    const [isHeads, setIsHeads] = useState(false);
    const getPlayerNames = useCallback(
        (didSendRequest, peerName) => {
            if (didSendRequest) {
                if (isHeads) {
                    return [peerName, name];
                } else {
                    return [name, peerName];
                }
            } else {
                if (isHeads) {
                    return [name, peerName];
                } else {
                    return [peerName, name];
                }
            }
        },
        [isHeads, name],
    );

    // Upon confirming match with a peer
    const dispatch = useDispatch();
    const onConfirmMatch = useCallback(
        (peerId, didSendRequest) => {
            const name = _.find(players, { peerId })?.name;
            dispatch(mainSlice.actions.setConnectedPeer({ peerId, name }));
            dispatch(mainSlice.actions.setIsConnectingToPeer(false));
            dispatch(mainSlice.actions.setIsGameActive(true));
            const [player1Name, player2Name] = getPlayerNames(
                didSendRequest,
                name,
            );
            dispatch(chessSlice.actions.setPlayer1Name(player1Name));
            dispatch(chessSlice.actions.setPlayer2Name(player2Name));
        },
        [dispatch, getPlayerNames, players],
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
    const requestMatch = useCallback((peerId) => {
        setPeerIdOfInboundReq(null);
        setPeerIdOfOutboundReq(peerId);
        const isHeads = Math.random() > 0.5;
        setIsHeads(isHeads);
        sendMessageToPeer(peerId, DUAL_SCREEN_MATCH_REQUEST, { isHeads });
    }, []);
    const confirmMatch = useCallback(
        (peerId) => {
            onConfirmMatch(peerId, false);
            sendMessageToPeer(peerId, DUAL_SCREEN_MATCH_CONFIRM);
        },
        [onConfirmMatch],
    );
    const rejectMatch = useCallback(
        (peerId) => {
            onRejectMatch(peerId);
            sendMessageToPeer(peerId, DUAL_SCREEN_MATCH_REJECT);
        },
        [onRejectMatch],
    );

    // Handle messages from peers
    useEffect(() => {
        const handlers = {
            [DUAL_SCREEN_SEARCH_REQUEST]: (message, peerId) => {
                const player = {
                    peerId,
                    name: message.payload.name,
                };
                addPlayer(player);
                sendMessageToPeer(peerId, DUAL_SCREEN_SEARCH_CONFIRM, { name });
            },
            [DUAL_SCREEN_SEARCH_CONFIRM]: (message, peerId) => {
                const player = {
                    peerId: peerId,
                    name: message.payload.name,
                };
                addPlayer(player);
            },
            [DUAL_SCREEN_SEARCH_CANCEL]: (message, peerId) => {
                removePlayer(peerId);
            },
            [PEER_DISCONNECT_MESSAGE_TYPE]: (message, peerId) => {
                removePlayer(peerId);
            },
            [DUAL_SCREEN_MATCH_REQUEST]: (message, peerId) => {
                const isBusy = peerIdOfOutboundReq || peerIdOfInboundReq;
                if (isBusy) {
                    sendMessageToPeer(peerId, DUAL_SCREEN_SEARCH_CANCEL);
                } else {
                    setPeerIdOfInboundReq(peerId);
                    setIsHeads(message.payload.isHeads);
                }
            },
            [DUAL_SCREEN_MATCH_CONFIRM]: (message, peerId) => {
                onConfirmMatch(peerId, true);
            },
            [DUAL_SCREEN_MATCH_REJECT]: (message, peerId) => {
                onRejectMatch(peerId);
            },
        };
        const cleanUpFns = Object.entries(handlers).map(
            ([messageType, handlerFn]) => {
                return addPeerMessageHandler(messageType, handlerFn);
            },
        );
        return () => cleanUpFns.forEach((cleanUpFn) => cleanUpFn());
    }, [
        addPlayer,
        name,
        onConfirmMatch,
        onRejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
        removePlayer,
    ]);

    // Send search request to peers
    useEffect(() => {
        sendMessageToPeers(DUAL_SCREEN_SEARCH_REQUEST, { name });
        return () => sendMessageToPeers(DUAL_SCREEN_SEARCH_CANCEL);
    }, [name]);

    return {
        players,
        requestMatch,
        confirmMatch,
        rejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
    };
};
