import classNames from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useTurn } from "../../getTurn";
import mainSlice from "../../mainSlice";
import { useElementLayoutObserver } from "../../util/useElementLayoutObserver";
import ChessBoard from "../ChessBoard/ChessBoard";
import TurnIndicator from "../TurnIndicator/TurnIndicator";
import styles from "./Chess.module.css";

const Chess = () => {
    // Set board size
    const dispatch = useDispatch();
    const boardContainerRef = useRef(null);
    const onBoardLayoutChange = useCallback(
        ({ width }) => {
            dispatch(mainSlice.actions.setBoardSizePx(width));
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
        if (!boardContainerRef.current) {
            return;
        }
        const onRightClick = (event) => {
            event.preventDefault();
        };
        const element = boardContainerRef.current;
        element.addEventListener("contextmenu", onRightClick);
        return () => element.removeEventListener("contextmenu", onRightClick);
    }, [boardContainerRef]);

    return (
        <div className={styles.container}>
            <div className={styles.boardContainer} ref={boardContainerRef}>
                <div className={classNames(styles.player, styles.player2)}>
                    <div className={styles.color} />
                    <div className={styles.name}>Player 2</div>
                    {activePlayer === "2" && turnElement}
                </div>
                <ChessBoard />
                <div className={classNames(styles.player, styles.player1)}>
                    <div className={styles.color} />
                    <div className={styles.name}>Player 1</div>
                    {activePlayer === "1" && turnElement}
                </div>
            </div>
            <TurnIndicator />
        </div>
    );
};

export default Chess;
("");
