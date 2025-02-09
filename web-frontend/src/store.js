import { configureStore } from "@reduxjs/toolkit";
import chessSlice from "./chess/chessSlice";
import mainSlice from "./main/mainSlice";

export const store = configureStore({
    reducer: {
        chess: chessSlice.reducer,
        main: mainSlice.reducer,
    },
});
