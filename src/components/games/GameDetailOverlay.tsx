import type { ReactNode } from "react";

type GameDetailOverlayProps = {
  title: string;
  titleId: string;
  onRequestClose: () => void;
  children: ReactNode;
};

export function GameDetailOverlay({ title, titleId, onRequestClose, children }: GameDetailOverlayProps) {
  return (
    <div role="dialog" aria-labelledby={titleId} aria-modal="true">
      <div>
        <h2 id={titleId}>{title}</h2>
        <button onClick={onRequestClose} aria-label="Close game details">
          Close
        </button>
        {children}
      </div>
    </div>
  );
}
