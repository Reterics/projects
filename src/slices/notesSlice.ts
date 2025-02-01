import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {NoteType} from '@/app/pwa/notes';
import IDBStore from '@/app/database/stores/IDBStore.ts';
import {NotesState} from '@/types.ts';
import {EncryptedData, isEncrypted} from '@/app/utils/crypto.ts';
import DBModel from '@/app/database/DBModel.ts';

const idbStore = new IDBStore({
  tables: ['notes'],
});

const decryptNote = async (note: NoteType) => {
  if (!note.content && isEncrypted(note as unknown as EncryptedData)) {
    let error;
    await DBModel.decryptDoc(note).catch((e) => {
      // console.error(e);
      error = e;
    });
    if (error) {
      return false;
    }
  }
  return true;
};

const applyTimeLabel = (notes: NoteType[]) => {
  const today = new Date();
  notes.forEach((note: NoteType) => {
    const updatedDate = new Date(note.updated);
    const isSameDay =
      updatedDate.getFullYear() === today.getFullYear() &&
      updatedDate.getMonth() === today.getMonth() &&
      updatedDate.getDate() === today.getDate();

    if (isSameDay) {
      note.timeLabel = updatedDate.toISOString().split('T')[1].substring(0, 5);
    } else {
      note.timeLabel = new Date(note.updated)
        .toISOString()
        .split('T')[0]
        .substring(2);
    }
  });
  return notes;
};

export const fetchNotes = createAsyncThunk<NoteType[]>(
  'notes/fetchNotes',
  async (_, {rejectWithValue}) => {
    try {
      await idbStore.load();
      const notes = idbStore.getAll('notes') as NoteType[];

      const decrypted: NoteType[] = [];
      for (const note of notes) {
        if (await decryptNote(note)) {
          decrypted.push(note);
        }
      }

      decrypted.sort((a, b) => Number(b.updated) - Number(a.updated));

      return applyTimeLabel(decrypted);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return rejectWithValue(err.message);
    }
  }
);

async function saveNoteIDB(note: NoteType) {
  if (!idbStore) {
    throw new Error('IDBStore is undefined');
  }

  if (idbStore.get(note.id, 'notes')) {
    await idbStore.update(note, 'notes');
  } else {
    await idbStore.push(note, 'notes');
  }
  return note;
}

export const saveNote = createAsyncThunk<NoteType, NoteType>(
  'notes/saveNote',
  async (note, {rejectWithValue}) => {
    try {
      const updated = await saveNoteIDB(note);
      await decryptNote(updated);
      return updated;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return rejectWithValue(err?.message);
    }
  }
);

export const updateNote = createAsyncThunk<NoteType, NoteType>(
  'notes/updateNote',
  async (note, {rejectWithValue}) => {
    try {
      const updated = await saveNoteIDB(note);
      await decryptNote(updated);
      return updated;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return rejectWithValue(err?.message);
    }
  }
);

export const deleteNote = createAsyncThunk<string, string>(
  'notes/deleteNote',
  async (noteId, {rejectWithValue}) => {
    try {
      await idbStore.remove(noteId, 'notes');
      return noteId;
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return rejectWithValue(err?.message);
    }
  }
);

const initialState: NotesState = {
  list: [],
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.list = action.payload;
      state.error = null;
    });
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(
      saveNote.fulfilled,
      (state, action: PayloadAction<NoteType>) => {
        state.list.push(action.payload);
        state.error = null;
      }
    );
    builder.addCase(saveNote.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(
      updateNote.fulfilled,
      (state, action: PayloadAction<NoteType>) => {
        const index = state.list.findIndex(
          (note) => note.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        } else {
          state.list.push(action.payload);
        }
        state.error = null;
      }
    );
    builder.addCase(updateNote.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(
      deleteNote.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.list = state.list.filter((note) => note.id !== action.payload);
        state.error = null;
      }
    );
    builder.addCase(deleteNote.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export default notesSlice.reducer;
