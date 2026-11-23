import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { usePlayer } from "@/lib/player";
import { usePrefs } from "@/lib/prefs";
import { importSpotifyPlaylist } from "@/lib/spotify.functions";

export function NewPlaylistButton({ className = "plus-btn" }: { className?: string }) {
  const createPlaylist = usePrefs((state) => state.createPlaylist);
  const importPlaylist = usePrefs((state) => state.importPlaylist);
  const setView = usePlayer((state) => state.setView);
  const setFocus = usePlayer((state) => state.setLibraryFocus);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function openPlaylist(id: string) {
    setOpen(false);
    setFocus(id);
    setView("playlist");
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setNote(null);
          setBusy(false);
        }
      }}
    >
      <Dialog.Trigger className={className} type="button" aria-label="Nueva playlist">
        <Plus />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content glass" aria-describedby="playlist-ayuda">
          <div className="dialog-head">
            <div>
              <Dialog.Title asChild>
                <h2>Nueva playlist</h2>
              </Dialog.Title>
              <Dialog.Description id="playlist-ayuda" className="note">
                Créala vacía o pega un enlace de playlist de Spotify. Se guardan solo en este navegador.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-btn" aria-label="Cerrar">
              <X />
            </Dialog.Close>
          </div>
          <form
            className="create-row"
            onSubmit={(event) => {
              event.preventDefault();
              const id = createPlaylist(name);
              if (!id) {
                setError("Escribe un nombre.");
                return;
              }
              setName("");
              setError(null);
              openPlaylist(id);
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre"
              aria-label="Nombre de la playlist"
              maxLength={40}
            />
            <button type="submit" className="solid-btn">
              Crear
            </button>
          </form>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              setNote(null);
              setBusy(true);
              void importSpotifyPlaylist({ data: { url } })
                .then((result) => {
                  const id = importPlaylist(result.name, result.tracks);
                  if (!id) {
                    setError("No se pudo guardar la playlist.");
                    return;
                  }
                  setUrl("");
                  setNote(
                    result.tracks.length < result.requested
                      ? `Se añadieron ${result.tracks.length} de ${result.requested} canciones.`
                      : `Lista lista con ${result.tracks.length} canciones.`,
                  );
                  openPlaylist(id);
                })
                .catch((reason: unknown) => {
                  setError(reason instanceof Error ? reason.message : "No se pudo importar.");
                })
                .finally(() => setBusy(false));
            }}
          >
            <label className="field-label" htmlFor="spotify-url">
              Enlace de Spotify
            </label>
            <div className="url-row">
              <input
                id="spotify-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://open.spotify.com/playlist/…"
                inputMode="url"
                aria-label="Enlace de playlist de Spotify"
              />
              <button type="submit" className="solid-btn" disabled={busy}>
                {busy ? "…" : "Importar"}
              </button>
            </div>
          </form>
          {busy ? <p className="note">Buscando las canciones. Puede tardar un momento.</p> : null}
          {note ? <p className="note">{note}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
