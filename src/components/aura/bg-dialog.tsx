import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X } from "lucide-react";
import { usePrefs } from "@/lib/prefs";
import type { SceneId } from "@/lib/types";

const PRESETS: { id: SceneId; label: string }[] = [
  { id: "bruma", label: "Bruma" },
  { id: "nocturno", label: "Nocturno" },
  { id: "brasa", label: "Brasa" },
  { id: "niebla", label: "Niebla" },
  { id: "marea", label: "Marea" },
];

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.72);
      URL.revokeObjectURL(url);
      if (data.length > 750_000) {
        reject(new Error("grande"));
        return;
      }
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen"));
    };
    image.src = url;
  });
}

function Toggle({
  label,
  hint,
  on,
  onClick,
}: {
  label: string;
  hint: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="toggle-row" aria-pressed={on} onClick={onClick}>
      <span>
        <strong>{label}</strong>
        <span className="track-artist">{hint}</span>
      </span>
      <span className={on ? "switch is-on" : "switch"} aria-hidden="true" />
    </button>
  );
}

export function SettingsButton() {
  const scene = usePrefs((state) => state.scene);
  const imageUrl = usePrefs((state) => state.imageUrl);
  const setScene = usePrefs((state) => state.setScene);
  const setImageUrl = usePrefs((state) => state.setImageUrl);
  const motion = usePrefs((state) => state.motion);
  const compact = usePrefs((state) => state.compact);
  const blur = usePrefs((state) => state.blur);
  const setMotion = usePrefs((state) => state.setMotion);
  const setCompact = usePrefs((state) => state.setCompact);
  const setBlur = usePrefs((state) => state.setBlur);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog.Root>
      <Dialog.Trigger className="icon-btn glass gear-btn" type="button" aria-label="Ajustes">
        <Settings />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content glass" aria-describedby="ajustes-ayuda">
          <div className="dialog-head">
            <div>
              <Dialog.Title asChild>
                <h2>Ajustes</h2>
              </Dialog.Title>
              <Dialog.Description id="ajustes-ayuda" className="note">
                El fondo y estas preferencias se guardan en este navegador.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-btn" aria-label="Cerrar">
              <X />
            </Dialog.Close>
          </div>
          <p className="field-label">Fondo</p>
          <div className="swatch-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={scene === preset.id ? `swatch scene-${preset.id} is-selected` : `swatch scene-${preset.id}`}
                onClick={() => {
                  setError(null);
                  setScene(preset.id);
                }}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
          <label className="solid-btn file-btn">
            Subir imagen
            <input
              className="sr-file"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void compressImage(file)
                  .then((data) => {
                    setImageUrl(data);
                    setScene("image");
                    setError(null);
                  })
                  .catch(() => setError("No se pudo usar esa imagen. Prueba con una más pequeña."));
              }}
            />
          </label>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              let parsed: URL;
              try {
                parsed = new URL(url.trim());
              } catch {
                setError("Pega una URL válida.");
                return;
              }
              if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
                setError("La URL tiene que empezar por http o https.");
                return;
              }
              setImageUrl(parsed.href);
              setScene("image");
              setError(null);
            }}
          >
            <label className="field-label" htmlFor="bg-url">
              O pega la URL de una imagen
            </label>
            <div className="url-row">
              <input
                id="bg-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://"
                inputMode="url"
              />
              <button type="submit" className="solid-btn">
                Usar
              </button>
            </div>
          </form>
          {error ? <p className="form-error">{error}</p> : null}
          {scene === "image" && imageUrl ? (
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setImageUrl(null);
                setScene("nocturno");
              }}
            >
              Quitar imagen
            </button>
          ) : null}
          <div className="toggle-list">
            <Toggle label="Animaciones" hint="Movimiento de tarjetas y fondo" on={motion} onClick={() => setMotion(!motion)} />
            <Toggle label="Modo compacto" hint="Menos aire entre paneles" on={compact} onClick={() => setCompact(!compact)} />
            <Toggle label="Desenfoque" hint="Efecto cristal en los paneles" on={blur} onClick={() => setBlur(!blur)} />
          </div>
          <p className="note">
            En el móvil la música sigue al cambiar de app si dejas la pestaña abierta. En Android, añadir BY MONTA a la
            pantalla de inicio ayuda. Si cierras el navegador del todo, el audio se para: ninguna web puede sonar con la
            pestaña eliminada.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
