import { createSlice } from "@reduxjs/toolkit";

const mainSlice = createSlice({
    name: "main",
    initialState: {
        name: "", // TODO: random name
        isPlayingLocalMultiplayer: false,
        isPlayingOnlineMultiplayer: false,
        isPlayingDualScreenMultiplayer: false,
        isLookingForOnlineMultiplayer: false,
    },
    reducers: {
        setName: (state, action) => {
            state.name = action.payload;
        },
        setIsPlayingLocalMultiplayer: (state, action) => {
            state.isPlayingLocalMultiplayer = action.payload;
        },
        setIsPlayingOnlineMultiplayer: (state, action) => {
            state.isPlayingOnlineMultiplayer = action.payload;
        },
        setIsPlayingDualScreenMultiplayer: (state, action) => {
            state.isPlayingDualScreenMultiplayer = action.payload;
        },
    },
});

export default mainSlice;
