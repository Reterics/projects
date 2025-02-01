import {NoteType} from '@/app/pwa/notes';
import {ProjectType} from '@/app/pwa/projects';

export interface NotesState {
  list: NoteType[];
  error: string | null;
}

export interface ProjectsState {
  list: ProjectType[];
  error: string | null;
}

export interface DesktopState {
  list: [];
  error: string | null;
}
