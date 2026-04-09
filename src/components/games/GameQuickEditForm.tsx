import { useForm } from "react-hook-form";
import type { Game } from "../../types/domain";

type QuickEditFormValues = {
  imageUrl: string;
  summary: string;
  publishedYear: string;
  playersMin: string;
  playersMax: string;
  playTimeMin: string;
  playTimeMax: string;
};

type Props = {
  game: Game;
  onSubmit: (values: QuickEditFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function GameQuickEditForm({ game, onSubmit, onCancel, isSubmitting }: Props) {
  const { register, handleSubmit } = useForm<QuickEditFormValues>({
    defaultValues: {
      imageUrl: game.imageUrl ?? "",
      summary: game.summary ?? "",
      publishedYear: game.publishedYear ? String(game.publishedYear) : "",
      playersMin: game.playersMin ? String(game.playersMin) : "",
      playersMax: game.playersMax ? String(game.playersMax) : "",
      playTimeMin: game.playTimeMin ? String(game.playTimeMin) : "",
      playTimeMax: game.playTimeMax ? String(game.playTimeMax) : "",
    },
  });
  const hasEditableField =
    game.imageUrl == null ||
    game.summary == null ||
    game.publishedYear == null ||
    game.playersMin == null ||
    game.playersMax == null ||
    game.playTimeMin == null ||
    game.playTimeMax == null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {game.imageUrl == null && (
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-on-surface mb-2">
            Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            {...register("imageUrl")}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="https://..."
          />
        </div>
      )}

      {game.summary == null && (
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-on-surface mb-2">
            Summary
          </label>
          <textarea
            id="summary"
            {...register("summary")}
            rows={4}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="Add a brief description..."
          />
        </div>
      )}
      {game.publishedYear == null && (
        <div>
          <label htmlFor="publishedYear" className="block text-sm font-medium text-on-surface mb-2">
            Published year
          </label>
          <input
            id="publishedYear"
            type="number"
            {...register("publishedYear")}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="e.g. 2022"
          />
        </div>
      )}
      {game.playersMin == null && (
        <div>
          <label htmlFor="playersMin" className="block text-sm font-medium text-on-surface mb-2">
            Players min
          </label>
          <input
            id="playersMin"
            type="number"
            {...register("playersMin")}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="e.g. 2"
          />
        </div>
      )}
      {game.playersMax == null && (
        <div>
          <label htmlFor="playersMax" className="block text-sm font-medium text-on-surface mb-2">
            Players max
          </label>
          <input
            id="playersMax"
            type="number"
            {...register("playersMax")}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="e.g. 5"
          />
        </div>
      )}
      {game.playTimeMin == null && (
        <div>
          <label htmlFor="playTimeMin" className="block text-sm font-medium text-on-surface mb-2">
            Play time min
          </label>
          <input
            id="playTimeMin"
            type="number"
            {...register("playTimeMin")}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="e.g. 45"
          />
        </div>
      )}
      {game.playTimeMax == null && (
        <div>
          <label htmlFor="playTimeMax" className="block text-sm font-medium text-on-surface mb-2">
            Play time max
          </label>
          <input
            id="playTimeMax"
            type="number"
            {...register("playTimeMax")}
            className="w-full rounded-lg bg-surface-container-highest px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            placeholder="e.g. 90"
          />
        </div>
      )}
      {!hasEditableField ? (
        <p className="text-sm text-on-surface-variant">No missing fields available to update.</p>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !hasEditableField}
          className="px-4 py-2 rounded-lg bg-gradient-to-br from-primary-container to-primary text-on-primary-fixed font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
