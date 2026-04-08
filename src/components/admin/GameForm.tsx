import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gameFormSchema, type GameFormValues } from "../../features/games/gameFormSchema";
import { useProfile } from "../../features/auth/useProfile";
import { useBggRefreshMutation } from "../../features/games/useBggRefreshMutation";
import { GameFormFields } from "./GameFormFields";
import type { Game } from "../../types/domain";

type Props = {
  game?: Game;
  onSubmit: (values: GameFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function GameForm({ game, onSubmit, onCancel, isSubmitting = false }: Props) {
  const { isOwner } = useProfile();
  const bggRefresh = useBggRefreshMutation();
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema) as Resolver<GameFormValues>,
    defaultValues: game
      ? {
          name: game.name,
          slug: game.slug,
          status: game.status,
          bggId: game.bggId ?? undefined,
          bggUrl: game.bggUrl ?? "",
          buyPriority: game.buyPriority ?? undefined,
          bggRating: game.bggRating ?? undefined,
          bggWeight: game.bggWeight ?? undefined,
          playersMin: game.playersMin ?? undefined,
          playersMax: game.playersMax ?? undefined,
          playTimeMin: game.playTimeMin ?? undefined,
          playTimeMax: game.playTimeMax ?? undefined,
          category: game.category ?? "",
          summary: game.summary ?? "",
          notes: game.notes ?? "",
          imageUrl: game.imageUrl ?? "",
          publishedYear: game.publishedYear ?? undefined,
          hidden: game.hidden,
        }
      : {
          status: "owned",
          hidden: false,
        },
  });

  function handleFormSubmit(values: GameFormValues): void {
    const slug =
      values.slug ||
      values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    onSubmit({ ...values, slug });
  }

  async function handleBggRefresh() {
    if (!game) return;

    setRefreshError(null);

    try {
      const { metadata } = await bggRefresh.mutateAsync({ gameId: game.id });

      setValue("bggId", metadata.bgg_id);
      setValue("bggUrl", metadata.bgg_url);
      setValue("bggRating", metadata.bgg_rating ?? undefined);
      setValue("bggWeight", metadata.bgg_weight ?? undefined);
      setValue("publishedYear", metadata.published_year ?? undefined);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "Unable to refresh BGG metadata.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <GameFormFields register={register} errors={errors} />

      {isOwner && game?.bggId ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">BoardGameGeek metadata</p>
              <p className="text-sm text-slate-600">
                Refresh the linked BGG rating, weight, year, and URL without touching your
                notes or summary.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBggRefresh}
              disabled={bggRefresh.isPending}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bggRefresh.isPending ? "Refreshing BGG…" : "Refresh BGG metadata"}
            </button>
          </div>
          {refreshError ? (
            <p className="mt-3 text-sm text-red-600">{refreshError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
