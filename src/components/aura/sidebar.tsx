import { AudioLines, Disc3, Heart, History, House, Library, ListMusic, Play } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { artwork } from "@/lib/media";
import { playTrack } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import { tracksFrom } from "@/lib/catalog";
import { Logo } from "@/components/aura/logo";
import { NewPlaylistButton } from "@/components/aura/playlist-dialog";
import type { AppView } from "@/lib/types";

const NAV: { id: AppView; label: string; icon: typeof House }[] = [
  { id: "home", label: "Inicio", icon: House },
  { id: "history", label: "Historial", icon: History },
  { id: "library", label: "Biblioteca", icon: Library },
  { id: "likes", label: "Me gusta", icon: Heart },
  { id: "albums", label: "Álbumes", icon: Disc3 },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "dj", label: "DJ", icon: AudioLines },
];

export function Sidebar() {
  const view = usePlayer((state) => state.view);
  const setView = usePlayer((state) => state.setView);
  const focus = usePlayer((state) => state.libraryFocus);
  const setFocus = usePlayer((state) => state.setLibraryFocus);
  const known = usePrefs((state) => state.known);
  const userPlaylists = usePrefs((state) => state.userPlaylists);

  return (
    <aside className="side glass">
      <button
        type="button"
        className="logo-row"
        onClick={() => {
          setFocus(null);
          setView("home");
        }}
      >
        <span className="logo-badge">
          <Logo className="logo-mark" />
        </span>
        <span className="logo-name">{BRAND.name}</span>
      </button>
      <div className="side-scroll">
        <nav className="nav-block" aria-label="Principal">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.id === "playlists" ? view === "playlists" || view === "playlist" : view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={active ? "nav-item is-active" : "nav-item"}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (item.id === "playlists") setFocus(null);
                  setView(item.id);
                }}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="side-head">
          <p className="side-label">Playlists</p>
          <NewPlaylistButton />
        </div>
        {userPlaylists.length === 0 ? <p className="side-empty">Todavía no has creado ninguna.</p> : null}
        {userPlaylists.map((playlist) => {
          const first = playlist.trackIds[0];
          const active = view === "playlist" && focus === playlist.id;
          return (
            <div key={playlist.id} className={active ? "plist is-active" : "plist"}>
              {first ? <img className="plist-art" src={artwork(first)} alt="" /> : <span className="plist-art">{playlist.name.slice(0, 1)}</span>}
              <button
                type="button"
                className="plist-name"
                onClick={() => {
                  setFocus(playlist.id);
                  setView("playlist");
                }}
              >
                {playlist.name}
              </button>
              <button
                type="button"
                className="plist-play"
                aria-label={`Reproducir ${playlist.name}`}
                onClick={() => {
                  const tracks = tracksFrom(playlist.trackIds, known);
                  const track = tracks[0];
                  if (track) void playTrack(track, tracks);
                }}
              >
                <Play />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
