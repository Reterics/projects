import {configureStore} from '@reduxjs/toolkit';

import notesReducer from '@/slices/notesSlice.ts';
import projectsReducer from '@/slices/projectsSlice.ts';
import desktopReducer from '@/slices/desktopSlice.ts';

const store = configureStore({
  reducer: {
    notes: notesReducer,
    projects: projectsReducer,
    desktop: desktopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
