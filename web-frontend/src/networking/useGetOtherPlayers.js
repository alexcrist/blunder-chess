import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    addPeerMessageHandler,
    PEER_DISCONNECT_MESSAGE_TYPE,
    sendMessageToPeer,
    sendMessageToPeers,
} from "./peerNetwork";

const DUAL_SCREEN_SEARCH_REQUEST = "DUAL_SCREEN_SEARCH_REQUEST";
const DUAL_SCREEN_SEARCH_CONFIRM = "DUAL_SCREEN_SEARCH_CONFIRM";
const DUAL_SCREEN_SEARCH_CANCEL = "DUAL_SCREEN_SEARCH_CANCEL";
const DUAL_SCREEN_MATCH_REQUEST = "DUAL_SCREEN_SEARCH_REQUEST";
const DUAL_SCREEN_MATCH_CONFIRM = "DUAL_SCREEN_SEARCH_CONFIRM";
const DUAL_SCREEN_MATCH_REJECT = "DUAL_SCREEN_SEARCH_REJECT";

export const useConnectToPlayer = (peerId) => {
    // TODO
};

export const useGetOtherPlayers = () => {
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
        };
        const cleanUpFns = Object.entries(handlers).map(
            ([messageType, handlerFn]) => {
                return addPeerMessageHandler(messageType, handlerFn);
            },
        );
        return () => cleanUpFns.forEach((cleanUpFn) => cleanUpFn());
    }, [addPlayer, name, removePlayer]);

    // Send search request to peers
    useEffect(() => {
        sendMessageToPeers(DUAL_SCREEN_SEARCH_REQUEST, { name });
        return () => sendMessageToPeers(DUAL_SCREEN_SEARCH_CANCEL);
    }, [name]);

    return players;
};
