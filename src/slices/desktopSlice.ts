import {createSlice} from '@reduxjs/toolkit';
import {DesktopState} from '../types.ts';

const initialState: DesktopState = {
  list: [],
  error: null,
};

const desktopSlice = createSlice({
  name: 'desktop',
  initialState,
  reducers: {
    // Define your reducers and actions here
  },
});

export const {} = desktopSlice.actions;
export default desktopSlice.reducer;
