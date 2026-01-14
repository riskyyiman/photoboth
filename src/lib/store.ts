import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type LayoutType = 'grid-2x2' | 'strip-4' | 'polaroid';

interface Photo {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface BoothStore {
  mode: 'landing' | 'studio';
  setMode: (mode: 'landing' | 'studio') => void;

  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;

  photos: Photo[];
  addPhoto: (url: string) => void;
  updatePhoto: (id: string, changes: Partial<Photo>) => void;

  selectedId: string | null;
  selectPhoto: (id: string | null) => void;

  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

export const useBoothStore = create<BoothStore>((set) => ({
  mode: 'landing',
  setMode: (mode) => set({ mode }),

  layout: 'strip-4',
  setLayout: (layout) => set({ layout }),

  photos: [],
  addPhoto: (url) =>
    set((state) => ({
      photos: [
        ...state.photos,
        {
          id: uuidv4(),
          url,
          x: 50,
          y: 50,
          scale: 1,
          rotation: 0,
        },
      ],
    })),
  updatePhoto: (id, changes) =>
    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    })),

  selectedId: null,
  selectPhoto: (id) => set({ selectedId: id }),

  backgroundColor: '#ffffff',
  setBackgroundColor: (color) => set({ backgroundColor: color }),
}));
