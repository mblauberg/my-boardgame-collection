import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recommendationEditorSchema,
  type RecommendationEditorValues,
} from "../../features/recommendations/recommendationEditorSchema";
import type { Game } from "../../types/domain";

type Props = {
  game: Game;
  onSave: (values: RecommendationEditorValues) => void;
  onCancel: () => void;
};

export function RecommendationEditor({ game, onSave, onCancel }: Props) {
  const { register, handleSubmit } = useForm<RecommendationEditorValues>({
    resolver: zodResolver(recommendationEditorSchema),
    defaultValues: {
      recommendationVerdict: game.recommendationVerdict ?? null,
      recommendationColour: game.recommendationColour ?? null,
      summary: game.summary ?? null,
      notes: game.notes ?? null,
      gapReason: game.gapReason ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Verdict</label>
        <input
          {...register("recommendationVerdict")}
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Why it fits</label>
        <textarea
          {...register("summary")}
          rows={3}
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Overlap / caveats</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Collection gap</label>
        <input
          {...register("gapReason")}
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
