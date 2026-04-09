import { useForm } from "react-hook-form";
import type { Game } from "../../types/domain";

type QuickEditFormValues = {
  imageUrl: string;
  summary: string;
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
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!game.imageUrl && (
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

      {!game.summary && (
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
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-gradient-to-br from-primary-container to-primary text-on-primary-fixed font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
