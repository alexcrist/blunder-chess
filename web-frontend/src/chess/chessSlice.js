import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const chessSlice = createSlice({
    name: "chess",
    initialState: {
        globalTurnIndex: 0,
        boardSizePx: null,
        boardState: {
            a1: "wr",
            b1: "wn",
            c1: "wb",
            d1: "wq",
            e1: "wk",
            f1: "wb",
            g1: "wn",
            h1: "wr",
            a2: "wp",
            b2: "wp",
            c2: "wp",
            d2: "wp",
            e2: "wp",
            f2: "wp",
            g2: "wp",
            h2: "wp",
            a7: "bp",
            b7: "bp",
            c7: "bp",
            d7: "bp",
            e7: "bp",
            f7: "bp",
            g7: "bp",
            h7: "bp",
            a8: "br",
            b8: "bn",
            c8: "bb",
            d8: "bq",
            e8: "bk",
            f8: "bb",
            g8: "bn",
            h8: "br",
        },
        boardSquaresBounds: {},
        moveHistory: [],
        sourceCoordinate: null,
        hoveredCoordinate: null,
        isMouseDown: false,
        draggedPieceXY: null,
        possibleMoves: [],
        isPromotingPawn: false,
        winner: null,
        isTie: false,
        player1Name: "Player 1",
        player2Name: "Player 2",
    },
    reducers: {
        setBoardSizePx: (state, action) => {
            state.boardSizePx = action.payload;
        },
        makeMove: (state, action) => {
            const move = action.payload;
            const { source, dest } = move;
            const possibleMove = state.possibleMoves.find((move) => {
                return move.dest === dest;
            });
            const coordinatesToDelete = possibleMove.coordinatesToDelete ?? [];
            for (const coordinate of coordinatesToDelete) {
                delete state.boardState[coordinate];
            }
            const additionalMoves = possibleMove.additionalMoves ?? [];
            for (const move of additionalMoves) {
                state.boardState[move.dest] = state.boardState[move.source];
                delete state.boardState[move.source];
            }
            state.boardState[dest] = state.boardState[source];
            delete state.boardState[source];
            state.moveHistory.push(move);
            const isPromotingPawn =
                state.boardState[move.dest][1] === "p" &&
                (move.dest[1] === "1" || move.dest[1] === "8");
            if (isPromotingPawn) {
                state.isPromotingPawn = true;
            } else {
                state.globalTurnIndex++;
            }
        },
        promotePawn: (state, action) => {
            const newPiece = action.payload;
            const previousMove =
                state.moveHistory[state.moveHistory.length - 1];
            const coordinate = previousMove.dest;
            state.boardState[coordinate] = newPiece;
            state.globalTurnIndex++;
            state.isPromotingPawn = false;
        },
        setBoardSquareBounds: (state, action) => {
            const { coordinate, bounds } = action.payload;
            state.boardSquaresBounds[coordinate] = bounds;
        },
        setSourceCoordinate: (state, action) => {
            state.sourceCoordinate = action.payload;
        },
        setIsMouseDown: (state, action) => {
            state.isMouseDown = action.payload;
        },
        setDraggedPieceXY: (state, action) => {
            state.draggedPieceXY = action.payload;
        },
        setHoveredCoordinate: (state, action) => {
            state.hoveredCoordinate = action.payload;
        },
        setPossibleMoves: (state, action) => {
            state.possibleMoves = action.payload;
        },
        setWinner: (state, action) => {
            state.winner = action.payload;
        },
        setIsTie: (state, action) => {
            state.isTie = action.payload;
        },
        setPlayer1Name: (state, action) => {
            state.player1Name = action.payload;
        },
        setPlayer2Name: (state, action) => {
            state.player2Name = action.payload;
        },
        syncData: (state, action) => {
            const {
                moveHistory,
                boardState,
                globalTurnIndex,
                isPromotingPawn,
                sourceCoordinate,
                hoveredCoordinate,
            } = action.payload;
            state.sourceCoordinate = sourceCoordinate;
            state.hoveredCoordinate = hoveredCoordinate;
            if (
                globalTurnIndex > state.globalTurnIndex &&
                !_.isEqual(boardState, state.boardState)
            ) {
                state.moveHistory = moveHistory;
                state.boardState = boardState;
                state.globalTurnIndex = globalTurnIndex;
                state.isPromotingPawn = isPromotingPawn;
            }
        },
    },
});

export default chessSlice;
