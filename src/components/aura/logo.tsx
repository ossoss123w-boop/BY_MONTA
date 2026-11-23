/** Icono de la app. Sustituye public/brand-mark.png para cambiar el logo. */
export function Logo({ className }: { className?: string }) {
  return <img className={className} src="/brand-mark.png" alt="" draggable={false} />;
}
