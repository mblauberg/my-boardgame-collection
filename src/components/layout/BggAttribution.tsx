type BggAttributionProps = {
  compact?: boolean;
};

export function BggAttribution({ compact = false }: BggAttributionProps) {
  return (
    <footer
      className={
        compact
          ? "mt-8 border-t border-outline-variant/30 py-4 text-center"
          : "mx-auto w-full max-w-7xl border-t border-outline-variant/30 px-4 pb-28 pt-6 text-center md:px-8 md:pb-8"
      }
    >
      <a
        href="https://boardgamegeek.com"
        target="_blank"
        rel="noreferrer"
        className="glass-action-button inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold text-primary transition-colors hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Powered by BGG
      </a>
    </footer>
  );
}
