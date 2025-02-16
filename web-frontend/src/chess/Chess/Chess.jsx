import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../main/Header/Header";
import { useGameSync } from "../../networking/useGameSync";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
import ChessBoard from "../ChessBoard/ChessBoard";
import chessSlice from "../chessSlice";
import { useTurn } from "../getTurn";
import TurnIndicator from "../TurnIndicator/TurnIndicator";
import TurnTimer from "../TurnTimer/TurnTimer";
import { useCalculatePossibleMoves } from "../useCalculatePossibleMoves";
import { useCheckForGameOver } from "../useCheckForGameOver";
import { useShouldSpinBoard } from "../useShouldSpinBoard";
import { useTurnTimer } from "../useTurnTimer";
import styles from "./Chess.module.css";

const Chess = () => {
    // Sync game state with peer (if applicable)
    useGameSync();

    // Use a turn timer
    useTurnTimer();

    // Calculate possible moves
    useCalculatePossibleMoves();

    // Check for win / tie
    useCheckForGameOver();

    // Store board size
    const dispatch = useDispatch();
    const boardContainerRef = useRef(null);
    const onBoardLayoutChange = useCallback(
        ({ width }) => {
            dispatch(chessSlice.actions.setBoardSizePx(width));
        },
        [dispatch],
    );
    useElementLayoutObserver(boardContainerRef, onBoardLayoutChange);

    // Warn user if navigating away
    const isTie = useSelector((state) => state.chess.isTie);
    const winner = useSelector((state) => state.chess.winner);
    useEffect(() => {
        const isGameOver = winner || isTie;
        if (!isGameOver) {
            window.onbeforeunload = () => true;
            return () => (window.onbeforeunload = null);
        }
    }, [isTie, winner]);

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

    // Should the board be spun 180°
    const turn = useTurn();
    const shouldSpinBoard = useShouldSpinBoard();
    const player1 = (
        <div
            className={classNames(styles.player, styles.player1, {
                [styles.isTurn]: turn[0] === "1",
            })}
        >
            <div className={styles.color} />
            <div className={styles.name}>{player1Name}</div>
            <TurnTimer player={"1"} />
        </div>
    );
    const player2 = (
        <div
            className={classNames(styles.player, styles.player2, {
                [styles.isTurn]: turn[0] === "2",
            })}
        >
            <div className={styles.color} />
            <div className={styles.name}>{player2Name}</div>
            <TurnTimer player={"2"} />
        </div>
    );

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.spacer} />
            <div
                className={classNames(styles.boardContainer, {})}
                ref={boardContainerRef}
            >
                {shouldSpinBoard ? player1 : player2}
                <ChessBoard />
                {shouldSpinBoard ? player2 : player1}
            </div>
            <div className={styles.spacer} />
            <TurnIndicator />
        </div>
    );
};

export default Chess;
