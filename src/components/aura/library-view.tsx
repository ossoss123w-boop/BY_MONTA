import { useEffect, useState } from "react";
import { ArrowLeft, AudioLines, Disc3, Heart, History, ListMusic, Trash2 } from "lucide-react";
import { searchCatalog, tracksFrom } from "@/lib/catalog";
import { artwork, formatTime } from "@/lib/media";
import { playTrack } from "@/lib/playback";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import { searchTracks } from "@/lib/search.functions";
import type { Track } from "@/lib/types";
import { NewPlaylistButton } from "@/components/aura/playlist-dialog";

function TrackRows({
  tracks,
  onRemove,
}: {
  tracks: Track[];
  onRemove?: (track: Track) => void;
}) {
  if (!tracks.length) return <p className="note">Todavía no hay canciones aquí.</p>;
  return (
    <ul className="track-list">
      {tracks.map((track) => (
        <li key={track.id}>
          <div className="track-line glass">
            <button type="button" className="result-row bare" onClick={() => void playTrack(track, tracks)}>
              <img src={artwork(track.id)} alt="" />
              <span>
                <span className="result-title clamp-2">{track.title}</span>
                <span className="result-artist">{track.artist}</span>
              </span>
              <span className="result-artist">{formatTime(track.duration)}</span>
            </button>
            {onRemove ? (
              <button type="button" className="danger" aria-label={`Quitar ${track.title}`} onClick={() => onRemove(track)}>
                <Trash2 />
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function HistoryView() {
  const recents = usePrefs((state) => state.recents);
  const known = usePrefs((state) => state.known);
  const tracks = tracksFrom(recents, known);
  return (
    <div>
      <h2>Historial</h2>
      <p className="note">Lo último que pusiste en este navegador.</p>
      <TrackRows tracks={tracks} />
    </div>
  );
}

export function LikesView() {
  const liked = usePrefs((state) => state.liked);
  const known = usePrefs((state) => state.known);
  const toggleLike = usePrefs((state) => state.toggleLike);
  const tracks = tracksFrom(liked, known);
  return (
    <div>
      <div className="library-head">
        <div>
          <h2>Me gusta</h2>
          <p>{tracks.length} canciones</p>
        </div>
        {tracks[0] ? (
          <button type="button" className="solid-btn" onClick={() => void playTrack(tracks[0] as Track, tracks)}>
            Reproducir
          </button>
        ) : null}
      </div>
      <TrackRows tracks={tracks} onRemove={(track) => toggleLike(track)} />
    </div>
  );
}

export function AlbumsView() {
  return (
    <div className="empty-block">
      <span className="tile-mark" aria-hidden="true">
        <Disc3 />
      </span>
      <h2>Álbumes</h2>
      <p className="note">Aún no hay álbumes guardados. Las listas que importes desde Spotify aparecen en Playlists.</p>
    </div>
  );
}

export function PlaylistsView() {
  const playlists = usePrefs((state) => state.userPlaylists);
  const setFocus = usePlayer((state) => state.setLibraryFocus);
  const setView = usePlayer((state) => state.setView);

  return (
    <div>
      <div className="library-head">
        <div>
          <h2>Playlists</h2>
          <p>Las que crees tú.</p>
        </div>
        <NewPlaylistButton className="plus-btn solid-plus" />
      </div>
      {playlists.length === 0 ? <p className="note">Pulsa + para crear una o importar un enlace de Spotify.</p> : null}
      <div className="tile-grid">
        {playlists.map((playlist) => {
          const cover = playlist.trackIds[0];
          return (
            <button
              key={playlist.id}
              type="button"
              className="tile glass"
              onClick={() => {
                setFocus(playlist.id);
                setView("playlist");
              }}
            >
              {cover ? <img className="tile-cover" src={artwork(cover)} alt="" /> : <span className="tile-mark">{playlist.name.slice(0, 1)}</span>}
              <span>
                <strong>{playlist.name}</strong>
                <p>{playlist.trackIds.length} canciones</p>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PlaylistDetail() {
  const focus = usePlayer((state) => state.libraryFocus);
  const setView = usePlayer((state) => state.setView);
  const playlists = usePrefs((state) => state.userPlaylists);
  const known = usePrefs((state) => state.known);
  const deletePlaylist = usePrefs((state) => state.deletePlaylist);
  const removeTrack = usePrefs((state) => state.removeTrack);
  const addTrack = usePrefs((state) => state.addTrack);
  const owned = playlists.find((playlist) => playlist.id === focus) ?? null;
  const tracks = tracksFrom(owned?.trackIds ?? [], known);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const q = query.trim();
    if (!owned || q.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("loading");
      searchTracks({ data: { q }, signal: controller.signal })
        .then((response) => {
          if (controller.signal.aborted) return;
          setResults(response.results);
          setStatus("done");
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResults(searchCatalog(q));
          setStatus("done");
        });
    }, 360);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [owned, query]);

  if (!owned) {
    return (
      <div>
        <button type="button" className="back-btn" onClick={() => setView("playlists")}>
          <ArrowLeft />
          Playlists
        </button>
        <p className="note">Esa playlist ya no está.</p>
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="back-btn" onClick={() => setView("playlists")}>
        <ArrowLeft />
        Playlists
      </button>
      <div className="library-head">
        <div>
          <h2>{owned.name}</h2>
          <p>{tracks.length} canciones</p>
        </div>
        <div className="row-actions">
          {tracks[0] ? (
            <button type="button" className="solid-btn" onClick={() => void playTrack(tracks[0] as Track, tracks)}>
              Reproducir
            </button>
          ) : null}
          <button
            type="button"
            className="danger"
            aria-label="Eliminar playlist"
            onClick={() => {
              deletePlaylist(owned.id);
              setView("playlists");
            }}
          >
            <Trash2 />
          </button>
        </div>
      </div>
      <label className="search-field glass add-search">
        <input
          value={query}
          placeholder="Añadir canciones"
          aria-label="Buscar canciones para añadir"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {status === "loading" ? <p className="note">Buscando…</p> : null}
      {results.length > 0 ? (
        <ul className="result-list">
          {results.map((track) => {
            const saved = owned.trackIds.includes(track.id);
            return (
              <li key={track.id}>
                <div className="track-line glass">
                  <button type="button" className="result-row bare" onClick={() => void playTrack(track, results)}>
                    <img src={artwork(track.id)} alt="" />
                    <span>
                      <span className="result-title clamp-2">{track.title}</span>
                      <span className="result-artist">{track.artist}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-btn"
                    disabled={saved}
                    onClick={() => addTrack(owned.id, track)}
                  >
                    {saved ? "Añadida" : "Añadir"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      <TrackRows tracks={tracks} onRemove={(track) => removeTrack(owned.id, track.id)} />
    </div>
  );
}

export function LibraryView() {
  const liked = usePrefs((state) => state.liked.length);
  const recents = usePrefs((state) => state.recents.length);
  const playlists = usePrefs((state) => state.userPlaylists.length);
  const setView = usePlayer((state) => state.setView);

  const cards = [
    { id: "likes" as const, label: "Me gusta", detail: `${liked} canciones`, icon: Heart },
    { id: "history" as const, label: "Historial", detail: `${recents} recientes`, icon: History },
    { id: "playlists" as const, label: "Playlists", detail: `${playlists} listas`, icon: ListMusic },
    { id: "dj" as const, label: "DJ", detail: "Cola continua", icon: AudioLines },
  ];

  return (
    <div>
      <h2>Biblioteca</h2>
      <p className="note">Todo lo que guardas se queda en este navegador.</p>
      <div className="tile-grid">
        {cards.map((card) => (
          <button key={card.id} type="button" className="tile glass" onClick={() => setView(card.id)}>
            <span className="tile-mark" aria-hidden="true">
              <card.icon />
            </span>
            <span>
              <strong>{card.label}</strong>
              <p>{card.detail}</p>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
