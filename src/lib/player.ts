import { create } from "zustand";
import type { AppView, RepeatMode, Track } from "@/lib/types";

type PlayerState = {
  view: AppView;
  past: AppView[];
  future: AppView[];
  drawer: boolean;
  query: string;
  libraryFocus: string | null;
  queue: Track[];
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  progress: number;
  duration: number;
  error: string | null;
  dj: boolean;
  setView: (view: AppView) => void;
  goBack: () => void;
  goForward: () => void;
  setDrawer: (drawer: boolean) => void;
  setQuery: (query: string) => void;
  setLibraryFocus: (libraryFocus: string | null) => void;
};

export const usePlayer = create<PlayerState>()((set) => ({
  view: "home",
  past: [],
  future: [],
  drawer: false,
  query: "",
  libraryFocus: null,
  queue: [],
  index: 0,
  playing: false,
  shuffle: false,
  repeat: "off",
  progress: 0,
  duration: 0,
  error: null,
  dj: false,
  setView: (view) =>
    set((state) => {
      if (state.view === view) return { drawer: false };
      return {
        view,
        drawer: false,
        past: [...state.past, state.view].slice(-24),
        future: [],
      };
    }),
  goBack: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1];
      if (!previous) return { drawer: false };
      return {
        view: previous,
        past: state.past.slice(0, -1),
        future: [state.view, ...state.future].slice(0, 24),
        drawer: false,
      };
    }),
  goForward: () =>
    set((state) => {
      const upcoming = state.future[0];
      if (!upcoming) return { drawer: false };
      return {
        view: upcoming,
        future: state.future.slice(1),
        past: [...state.past, state.view].slice(-24),
        drawer: false,
      };
    }),
  setDrawer: (drawer) => set({ drawer }),
  setQuery: (query) => set({ query }),
  setLibraryFocus: (libraryFocus) => set({ libraryFocus }),
}));

export function useCurrentTrack() {
  return usePlayer((state) => state.queue[state.index] ?? null);
}
