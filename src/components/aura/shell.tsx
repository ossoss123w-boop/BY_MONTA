import { useEffect } from "react";
import { House, Library, ListMusic, Search } from "lucide-react";
import { next, prev, togglePlay } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import { applyVolume, preloadApi } from "@/lib/youtube";
import { Backdrop } from "@/components/aura/backdrop";
import { DjView } from "@/components/aura/dj-view";
import { HomeView } from "@/components/aura/home-view";
import { AlbumsView, HistoryView, LibraryView, LikesView, PlaylistDetail, PlaylistsView } from "@/components/aura/library-view";
import { PlayerBar } from "@/components/aura/player-bar";
import { SearchView } from "@/components/aura/search-view";
import { Sidebar } from "@/components/aura/sidebar";
import { TopBar } from "@/components/aura/topbar";

const TABS = [
  { id: "home" as const, label: "Inicio", icon: House },
  { id: "search" as const, label: "Buscar", icon: Search },
  { id: "playlists" as const, label: "Playlists", icon: ListMusic },
  { id: "library" as const, label: "Biblioteca", icon: Library },
];

export function Shell() {
  const view = usePlayer((state) => state.view);
  const setView = usePlayer((state) => state.setView);
  const drawer = usePlayer((state) => state.drawer);
  const setDrawer = usePlayer((state) => state.setDrawer);

  useEffect(() => {
    const apply = () => {
      const { volume, muted, motion, compact, blur } = usePrefs.getState();
      applyVolume(muted ? 0 : volume);
      const root = document.documentElement;
      root.dataset.motion = motion ? "on" : "off";
      root.dataset.compact = compact ? "on" : "off";
      root.dataset.blur = blur ? "on" : "off";
    };
    void usePrefs.persist.rehydrate();
    const kick = () => {
      void preloadApi().catch(() => undefined);
    };
    window.addEventListener("pointerdown", kick, { once: true });
    const unsubHydrate = usePrefs.persist.onFinishHydration(apply);
    const unsub = usePrefs.subscribe(apply);
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, button, a")) return;
      if (event.code === "Space") {
        event.preventDefault();
        void togglePlay();
      } else if (event.code === "ArrowRight" && event.shiftKey) {
        void next();
      } else if (event.code === "ArrowLeft" && event.shiftKey) {
        void prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", onKey);
      unsubHydrate();
      unsub();
    };
  }, []);

  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <Backdrop />
      <div className={drawer ? "app-shell is-drawer" : "app-shell"}>
        <button type="button" className="drawer-scrim" aria-label="Cerrar menú" onClick={() => setDrawer(false)} />
        <Sidebar />
        <main className="main-panel" id="contenido">
          <TopBar />
          <div className="main-scroll">
            {view === "home" ? <HomeView /> : null}
            {view === "search" ? <SearchView /> : null}
            {view === "history" ? <HistoryView /> : null}
            {view === "library" ? <LibraryView /> : null}
            {view === "likes" ? <LikesView /> : null}
            {view === "albums" ? <AlbumsView /> : null}
            {view === "playlists" ? <PlaylistsView /> : null}
            {view === "playlist" ? <PlaylistDetail /> : null}
            {view === "dj" ? <DjView /> : null}
          </div>
        </main>
        <PlayerBar />
        <nav className="tab-bar glass" aria-label="Navegación">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id || (tab.id === "playlists" && view === "playlist");
            return (
              <button
                key={tab.id}
                type="button"
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setView(tab.id)}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
