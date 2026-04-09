import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { GameFormValues } from "../../features/games/gameFormSchema";

type Props = {
  register: UseFormRegister<GameFormValues>;
  errors: FieldErrors<GameFormValues>;
};

export function GameFormFields({ register, errors }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-on-surface">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-error dark:text-error">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-on-surface">
          Status
        </label>
        <select
          id="status"
          {...register("status")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="owned">owned</option>
          <option value="buy">buy</option>
          <option value="new_rec">new_rec</option>
          <option value="cut">cut</option>
          <option value="archived">archived</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-on-surface">
          Category
        </label>
        <input
          id="category"
          type="text"
          {...register("category")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="playersMin" className="block text-sm font-medium text-on-surface">
            Players (min)
          </label>
          <input
            id="playersMin"
            type="number"
            {...register("playersMin", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="playersMax" className="block text-sm font-medium text-on-surface">
            Players (max)
          </label>
          <input
            id="playersMax"
            type="number"
            {...register("playersMax", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="playTimeMin" className="block text-sm font-medium text-on-surface">
            Play time (min)
          </label>
          <input
            id="playTimeMin"
            type="number"
            {...register("playTimeMin", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="playTimeMax" className="block text-sm font-medium text-on-surface">
            Play time (max)
          </label>
          <input
            id="playTimeMax"
            type="number"
            {...register("playTimeMax", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-on-surface">
          Summary
        </label>
        <textarea
          id="summary"
          rows={3}
          {...register("summary")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-on-surface">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-on-surface">
          Image URL
        </label>
        <input
          id="imageUrl"
          type="text"
          {...register("imageUrl")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="publishedYear" className="block text-sm font-medium text-on-surface">
          Published year
        </label>
        <input
          id="publishedYear"
          type="number"
          {...register("publishedYear", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="hidden"
          type="checkbox"
          {...register("hidden")}
          className="h-4 w-4 rounded border-outline-variant"
        />
        <label htmlFor="hidden" className="text-sm font-medium text-on-surface">
          Hidden from public view
        </label>
      </div>
    </div>
  );
}
