import { LibraryStateIconButton } from "./LibraryStateIconButton";

type LibraryStateActionGroupProps = {
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  disabled?: boolean;
  onToggleSaved: () => void;
  onToggleLoved: () => void;
  onToggleCollection: () => void;
};

export function LibraryStateActionGroup({
  isSaved,
  isLoved,
  isInCollection,
  disabled = false,
  onToggleSaved,
  onToggleLoved,
  onToggleCollection,
}: LibraryStateActionGroupProps) {
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Library actions">
      <LibraryStateIconButton
        label="Loved"
        icon="favorite"
        isActive={isLoved}
        disabled={disabled}
        showLabel
        onClick={() => onToggleLoved()}
      />
      <LibraryStateIconButton
        label="Saved"
        icon="bookmark"
        isActive={isSaved}
        disabled={disabled || isInCollection}
        showLabel
        onClick={() => onToggleSaved()}
      />
      <LibraryStateIconButton
        label="In Collection"
        icon="shelves"
        isActive={isInCollection}
        disabled={disabled || isSaved}
        showLabel
        onClick={() => onToggleCollection()}
      />
    </div>
  );
}
