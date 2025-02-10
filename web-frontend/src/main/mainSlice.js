import { createSlice } from "@reduxjs/toolkit";
import { generateRandomName } from "./generateRandomName";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: generateRandomName(),
        isGameActive: false,
        isConnectingToDualScreen: true, // TODO: revert to false
        connectedPeerId: null,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        },
        setIsGameActive: (state, action) => {
            state.isGameActive = action.payload;
        },
        setIsConnectingToDualScreen: (state, action) => {
            state.isConnectingToDualScreen = action.payload;
        },
        setConnectedPeerId: (state, action) => {
            // TODO
        },
    },
});

export default mainSlice;
