import _ from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import chessSlice from "../chess/chessSlice";
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
    const sourceCoordinate = useSelector(
        (state) => state.chess.sourceCoordinate,
    );
    const hoveredCoordinate = useSelector(
        (state) => state.chess.hoveredCoordinate,
    );
    useEffect(() => {
        if (connectedPeer) {
            sendMessageToPeerThrottled(connectedPeer?.peerId, GAME_UPDATE, {
                moveHistory,
                boardState,
                globalTurnIndex,
                isPromotingPawn,
                connectedPeer,
                sourceCoordinate,
                hoveredCoordinate,
            });
        }
    }, [
        boardState,
        connectedPeer,
        globalTurnIndex,
        isPromotingPawn,
        moveHistory,
        sourceCoordinate,
        hoveredCoordinate,
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
                        sourceCoordinate,
                        hoveredCoordinate,
                    } = message.payload;
                    dispatch(
                        chessSlice.actions.syncData({
                            moveHistory,
                            boardState,
                            globalTurnIndex,
                            isPromotingPawn,
                            connectedPeer,
                            sourceCoordinate,
                            hoveredCoordinate,
                        }),
                    );
                },
            );
        }
    }, [connectedPeer, dispatch]);
    const [showedDisconnectedMessage, setShowedDisconnectedMessage] =
        useState(false);
    useEffect(() => {
        if (connectedPeer) {
            return addPeerMessageHandler(
                connectedPeer.peerId,
                PEER_DISCONNECT_MESSAGE_TYPE,
                () => {
                    if (!showedDisconnectedMessage) {
                        setShowedDisconnectedMessage(true);
                        alert(`${connectedPeer.name} disconnected.`);
                    }
                },
            );
        }
    }, [connectedPeer, showedDisconnectedMessage]);
};
