import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { usePlayer } from "@/lib/player";
import { SettingsButton } from "@/components/aura/bg-dialog";
import { Logo } from "@/components/aura/logo";

export function TopBar() {
  const query = usePlayer((state) => state.query);
  const setQuery = usePlayer((state) => state.setQuery);
  const setView = usePlayer((state) => state.setView);
  const past = usePlayer((state) => state.past);
  const future = usePlayer((state) => state.future);
  const goBack = usePlayer((state) => state.goBack);
  const goForward = usePlayer((state) => state.goForward);
  const drawer = usePlayer((state) => state.drawer);
  const setDrawer = usePlayer((state) => state.setDrawer);

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-btn"
        aria-label={drawer ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={drawer}
        onClick={() => setDrawer(!drawer)}
      >
        <Menu />
      </button>
      <div className="nav-history">
        <button type="button" className="icon-btn" aria-label="Atrás" disabled={past.length === 0} onClick={goBack}>
          <ChevronLeft />
        </button>
        <button type="button" className="icon-btn" aria-label="Adelante" disabled={future.length === 0} onClick={goForward}>
          <ChevronRight />
        </button>
      </div>
      <button type="button" className="brand-lockup" onClick={() => setView("home")}>
        <span className="logo-badge">
          <Logo className="logo-mark" />
        </span>
        <span className="logo-name">{BRAND.name}</span>
      </button>
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setView("search");
        }}
      >
        <label className="search-field glass">
          <Search />
          <input
            type="search"
            value={query}
            placeholder="Buscar canciones o artistas"
            aria-label="Buscar"
            onChange={(event) => {
              setQuery(event.target.value);
              setView("search");
            }}
            onFocus={() => setView("search")}
          />
          {query ? (
            <button
              type="button"
              className="clear-btn"
              aria-label="Borrar búsqueda"
              onClick={() => {
                setQuery("");
                setView("home");
              }}
            >
              <X />
            </button>
          ) : null}
        </label>
      </form>
      <SettingsButton />
    </header>
  );
}
