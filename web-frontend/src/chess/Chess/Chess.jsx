import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGameSync } from "../../networking/useGameSync";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
import ChessBoard from "../ChessBoard/ChessBoard";
import chessSlice from "../chessSlice";
import { useTurn } from "../getTurn";
import TurnIndicator from "../TurnIndicator/TurnIndicator";
import { useCalculatePossibleMoves } from "../useCalculatePossibleMoves";
import { useCheckForGameOver } from "../useCheckForGameOver";
import styles from "./Chess.module.css";

const Chess = () => {
    // Sync game state with peer (if applicable)
    const isConnectedToPeer = useGameSync();

    // Calculate possible moves
    useCalculatePossibleMoves();

    // Check for win / tie
    useCheckForGameOver();
    const winner = useSelector((state) => state.chess.winner);
    const isTie = useSelector((state) => state.chess.isTie);

    // If online match, warn user if they navigate away while peer is connected and while
    // game is ongoing
    const isOnlineGame = useSelector((state) => state.main.isOnlineGame);
    const moveHistory = useSelector((state) => state.chess.moveHistory);
    useEffect(() => {
        const isGameOver = winner !== null || isTie;
        const didPeerDisconnect = isOnlineGame && !isConnectedToPeer;
        const isZeroMoveLocalGame = !isOnlineGame && moveHistory.length === 0;
        if (!didPeerDisconnect && !isGameOver && !isZeroMoveLocalGame) {
            window.onbeforeunload = () => true;
            return () => (window.onbeforeunload = null);
        }
    }, [isConnectedToPeer, isOnlineGame, isTie, moveHistory.length, winner]);

    // Set board size
    const dispatch = useDispatch();
    const boardContainerRef = useRef(null);
    const onBoardLayoutChange = useCallback(
        ({ width }) => {
            dispatch(chessSlice.actions.setBoardSizePx(width));
        },
        [dispatch],
    );
    useElementLayoutObserver(boardContainerRef, onBoardLayoutChange);

    // Current turn text
    const turn = useTurn();
    const [activePlayer, color] = turn;
    const turnElement = (
        <div
            className={classNames(styles.turn, {
                [styles.isWhiteTurn]: color === "w",
            })}
        >
            to move {color === "w" ? "white" : "black"}
        </div>
    );

    // Disable right clicking board
    useEffect(() => {
        const element = boardContainerRef.current;
        if (element) {
            const onRightClick = (event) => event.preventDefault();
            element.addEventListener("contextmenu", onRightClick);
            return () =>
                element.removeEventListener("contextmenu", onRightClick);
        }
    }, [boardContainerRef]);

    // Get player names
    const player1Name = useSelector((state) => state.chess.player1Name);
    const player2Name = useSelector((state) => state.chess.player2Name);

    return (
        <div className={styles.container}>
            <div className={styles.spacer} />
            <div className={styles.boardContainer} ref={boardContainerRef}>
                <div className={classNames(styles.player, styles.player2)}>
                    <div className={styles.color} />
                    <div className={styles.name}>{player2Name}</div>
                    {activePlayer === "2" && turnElement}
                </div>
                <ChessBoard />
                <div className={classNames(styles.player, styles.player1)}>
                    <div className={styles.color} />
                    <div className={styles.name}>{player1Name}</div>
                    {activePlayer === "1" && turnElement}
                </div>
            </div>
            <div className={styles.spacer} />
            <TurnIndicator />
        </div>
    );
};

export default Chess;
