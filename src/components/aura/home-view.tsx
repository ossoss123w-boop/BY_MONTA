import { AudioLines, Play } from "lucide-react";
import { PLAYLISTS, tracksFrom } from "@/lib/catalog";
import { artwork } from "@/lib/media";
import { playTrack, startDj } from "@/lib/playback";
import { usePrefs } from "@/lib/prefs";
import type { Track } from "@/lib/types";
import { TrackCard } from "@/components/aura/track-card";

function Rail({ title, tracks, hint }: { title: string; tracks: Track[]; hint?: string }) {
  if (!tracks.length) return null;
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {hint ? <p className="note">{hint}</p> : null}
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Reproducir ${title}`}
          onClick={() => {
            const first = tracks[0];
            if (first) void playTrack(first, tracks);
          }}
        >
          <Play />
        </button>
      </div>
      <div className="rail">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} queue={tracks} />
        ))}
      </div>
    </section>
  );
}

export function HomeView() {
  const recents = usePrefs((state) => state.recents);
  const liked = usePrefs((state) => state.liked);
  const known = usePrefs((state) => state.known);
  const recentTracks = tracksFrom(recents, known);
  const likedTracks = tracksFrom(liked, known);

  return (
    <div>
      <button type="button" className="dj-banner panel" onClick={() => void startDj()}>
        <span className="dj-mark" aria-hidden="true">
          <AudioLines />
        </span>
        <span>
          <p className="kicker">DJ</p>
          <strong>Lo que has estado escuchando</strong>
          <p>Una cola continua a partir de tu historial.</p>
        </span>
        <span className="play-btn" aria-hidden="true">
          <Play />
        </span>
      </button>
      <section className="section">
        <div className="section-head">
          <div>
            <h2>Para empezar</h2>
            <p className="note">Elige un ambiente. No se guarda como playlist.</p>
          </div>
        </div>
        <div className="rail">
          {PLAYLISTS.map((playlist) => {
            const tracks = tracksFrom(playlist.trackIds);
            const cover = tracks[0];
            return (
              <button
                key={playlist.id}
                type="button"
                className="genre-card"
                onClick={() => {
                  const first = tracks[0];
                  if (first) void playTrack(first, tracks);
                }}
              >
                {cover ? <img src={artwork(cover.id)} alt="" /> : null}
                <span>
                  {(() => {
                    const label = playlist.name.replace(/^Aura\s+/i, "");
                    return label.charAt(0).toUpperCase() + label.slice(1);
                  })()}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <Rail title="Recientes" hint="Según lo que acabas de poner." tracks={recentTracks} />
      <Rail title="Me gusta" tracks={likedTracks} />
    </div>
  );
}
