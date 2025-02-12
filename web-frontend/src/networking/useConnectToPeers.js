import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigateToGameOnline } from "../main/useNavigation";
import {
    addNetworkMessageHandler,
    PEER_DISCONNECT_MESSAGE_TYPE,
    sendMessageToPeer,
    sendMessageToPeers,
} from "./peerNetwork";

const DUAL_SCREEN_SEARCH_REQUEST = "DUAL_SCREEN_SEARCH_REQUEST";
const DUAL_SCREEN_SEARCH_CONFIRM = "DUAL_SCREEN_SEARCH_CONFIRM";
const DUAL_SCREEN_SEARCH_CANCEL = "DUAL_SCREEN_SEARCH_CANCEL";

const DUAL_SCREEN_MATCH_REQUEST = "DUAL_SCREEN_MATCH_REQUEST";
const DUAL_SCREEN_MATCH_ACCEPT = "DUAL_SCREEN_MATCH_ACCEPT";
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
    const requestMatch = useCallback((peerId) => {
        setPeerIdOfInboundReq(null);
        setPeerIdOfOutboundReq(peerId);
        const isHeads = Math.random() > 0.5;
        setIsHeads(isHeads);
        sendMessageToPeer(peerId, DUAL_SCREEN_MATCH_REQUEST, { isHeads });
    }, []);
    const acceptMatch = useCallback(
        (peerId) => {
            onAcceptMatch(peerId, false);
            sendMessageToPeer(peerId, DUAL_SCREEN_MATCH_ACCEPT);
        },
        [onAcceptMatch],
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
            [DUAL_SCREEN_MATCH_ACCEPT]: (message, peerId) => {
                onAcceptMatch(peerId, true);
            },
            [DUAL_SCREEN_MATCH_REJECT]: (message, peerId) => {
                onRejectMatch(peerId);
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
    ]);

    // Send search request to peers
    useEffect(() => {
        sendMessageToPeers(DUAL_SCREEN_SEARCH_REQUEST, { name });
        return () => sendMessageToPeers(DUAL_SCREEN_SEARCH_CANCEL);
    }, [name]);

    return {
        players,
        requestMatch,
        acceptMatch,
        rejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
    };
};
