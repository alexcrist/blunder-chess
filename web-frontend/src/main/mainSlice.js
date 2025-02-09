import { createSlice } from "@reduxjs/toolkit";
import { generateRandomName } from "./generateRandomName";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: generateRandomName(),
        isGameActive: false,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        },
        setIsGameActive: (state, action) => {
            state.isGameActive = action.payload;
        },
    },
});

export default mainSlice;
