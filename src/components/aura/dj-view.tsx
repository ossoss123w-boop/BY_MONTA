import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { artwork, formatTime } from "@/lib/media";
import { next, prev, startDj, stopDj, togglePlay } from "@/lib/playback";
import { useCurrentTrack, usePlayer } from "@/lib/player";

export function DjView() {
  const track = useCurrentTrack();
  const queue = usePlayer((state) => state.queue);
  const index = usePlayer((state) => state.index);
  const playing = usePlayer((state) => state.playing);
  const dj = usePlayer((state) => state.dj);
  const progress = usePlayer((state) => state.progress);
  const duration = usePlayer((state) => state.duration);
  const upcoming = queue[index + 1];
  const max = duration > 0 ? duration : track?.duration || 0;
  const pct = max > 0 ? Math.min(100, (progress / max) * 100) : 0;

  return (
    <section className="dj">
      <p className="kicker">DJ</p>
      <h2>Lo que has estado escuchando</h2>
      <p className="note">Sigue con canciones parecidas a tu historial y a me gusta. No se corta al pasar de pista.</p>
      <div className="dj-stage panel">
        {track ? <img className="dj-cover" src={artwork(track.id)} alt="" /> : <span className="dj-cover cover-fallback" />}
        <div className="dj-copy">
          <strong>{track?.title ?? "Listo para empezar"}</strong>
          <p>{track?.artist ?? "El DJ usa lo que ya escuchaste"}</p>
          <div className="dj-time">
            <span>{formatTime(progress)}</span>
            <span className="dj-bar" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </span>
            <span>{formatTime(max)}</span>
          </div>
          <div className="transport dj-transport">
            <button type="button" className="icon-btn" aria-label="Anterior" disabled={!track} onClick={() => void prev()}>
              <SkipBack />
            </button>
            <button
              type="button"
              className="play-btn"
              aria-label={playing && dj ? "Pausar" : "Reproducir"}
              onClick={() => {
                if (!dj || !track) void startDj();
                else void togglePlay();
              }}
            >
              {playing && dj ? <Pause /> : <Play />}
            </button>
            <button type="button" className="icon-btn" aria-label="Siguiente" disabled={!track} onClick={() => void next()}>
              <SkipForward />
            </button>
          </div>
        </div>
      </div>
      {upcoming ? (
        <button type="button" className="dj-next panel" onClick={() => void next()}>
          <img src={artwork(upcoming.id)} alt="" />
          <span>
            <span className="kicker">A continuación</span>
            <strong>{upcoming.title}</strong>
            <span className="track-artist">{upcoming.artist}</span>
          </span>
        </button>
      ) : null}
      <div className="row-actions">
        {dj ? (
          <button type="button" className="text-btn" onClick={stopDj}>
            Salir del DJ
          </button>
        ) : (
          <button type="button" className="solid-btn" onClick={() => void startDj()}>
            Empezar DJ
          </button>
        )}
      </div>
    </section>
  );
}
