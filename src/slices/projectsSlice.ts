import {createSlice} from '@reduxjs/toolkit';
import {ProjectsState} from '../types.ts';

const initialState: ProjectsState = {
  list: [],
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Define your reducers and actions here
  },
});

export const {} = projectsSlice.actions;
export default projectsSlice.reducer;
