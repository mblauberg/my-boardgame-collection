import { useState } from "react";
import { useUpdateGameTags } from "../../features/games/useGameMutations";
import type { Tag } from "../../types/domain";

type Props = {
  gameId: string;
  allTags: Tag[];
  assignedTags: Tag[];
};

export function GameTagSelector({ gameId, allTags, assignedTags }: Props) {
  const updateGameTags = useUpdateGameTags();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(assignedTags.map((t) => t.id)),
  );

  function toggle(tagId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }

  async function handleSave() {
    await updateGameTags.mutateAsync({ gameId, tagIds: [...selected] });
  }

  const grouped = allTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const key = tag.tagType ?? "uncategorised";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tag);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {Object.entries(grouped).map(([type, tags]) => (
          <div key={type}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {type}
            </p>
            <div className="space-y-1">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(tag.id)}
                    onChange={() => toggle(tag.id)}
                    aria-label={tag.name}
                    className="h-4 w-4 rounded border-outline-variant"
                  />
                  <span className="text-sm text-on-surface">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={updateGameTags.isPending}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {updateGameTags.isPending ? "Saving…" : "Save tags"}
      </button>
    </div>
  );
}
