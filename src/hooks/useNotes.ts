import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../store.ts';
import {fetchNotes} from '@/slices/notesSlice.ts';

export const useNotes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes.list);
  const error = useSelector((state: RootState) => state.notes.error);

  useEffect(() => {
    if (notes.length === 0) {
      dispatch(fetchNotes());
    }
  }, [dispatch, notes.length]);

  return {notes, error};
};
