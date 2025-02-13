import _ from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import chessSlice from "../chess/chessSlice";
import mainSlice from "../main/mainSlice";
import {
    addPeerMessageHandler,
    PEER_DISCONNECT_MESSAGE_TYPE,
    sendMessageToPeer,
} from "./peerNetwork";

const GAME_UPDATE = "game-update";

const sendMessageToPeerThrottled = _.throttle(sendMessageToPeer, 50);

export const useGameSync = () => {
    const dispatch = useDispatch();
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    const boardState = useSelector((state) => state.chess.boardState);
    const globalTurnIndex = useSelector((state) => state.chess.globalTurnIndex);
    const isPromotingPawn = useSelector((state) => state.chess.isPromotingPawn);
    const connectedPeer = useSelector((state) => state.main.connectedPeer);
    const moveDurationsMs = useSelector((state) => state.chess.moveDurationsMs);
    useEffect(() => {
        if (connectedPeer) {
            if (moveHistory.length === moveDurationsMs.length) {
                sendMessageToPeerThrottled(connectedPeer?.peerId, GAME_UPDATE, {
                    moveHistory,
                    boardState,
                    globalTurnIndex,
                    isPromotingPawn,
                    connectedPeer,
                    moveDurationsMs,
                });
            }
        }
    }, [
        boardState,
        connectedPeer,
        globalTurnIndex,
        isPromotingPawn,
        moveDurationsMs,
        moveHistory,
    ]);
    useEffect(() => {
        if (connectedPeer) {
            return addPeerMessageHandler(
                connectedPeer.peerId,
                GAME_UPDATE,
                (message) => {
                    const {
                        moveHistory,
                        boardState,
                        globalTurnIndex,
                        isPromotingPawn,
                        connectedPeer,
                        moveDurationsMs,
                    } = message.payload;
                    dispatch(
                        chessSlice.actions.syncData({
                            moveHistory,
                            boardState,
                            globalTurnIndex,
                            isPromotingPawn,
                            connectedPeer,
                            moveDurationsMs,
                        }),
                    );
                },
            );
        }
    }, [connectedPeer, dispatch]);
    useEffect(() => {
        if (connectedPeer) {
            return addPeerMessageHandler(
                connectedPeer.peerId,
                PEER_DISCONNECT_MESSAGE_TYPE,
                () => {
                    dispatch(mainSlice.actions.setDidPeerDisconnect(true));
                },
            );
        }
    }, [connectedPeer, dispatch]);
};
