import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTag, useUpdateTag } from "../../features/tags/useTagMutations";
import type { Tag } from "../../types/domain";

const tagFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional().default(""),
  tagType: z.string().nullable().optional(),
  colour: z.string().nullable().optional(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;
type Panel = { mode: "create" } | { mode: "edit"; tag: Tag };

type Props = {
  tags: Tag[];
};

function TagForm({
  tag,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  tag?: Tag;
  onSubmit: (v: TagFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema) as Resolver<TagFormValues>,
    defaultValues: tag
      ? { name: tag.name, slug: tag.slug, tagType: tag.tagType ?? "", colour: tag.colour ?? "" }
      : {},
  });

  function handleFormSubmit(values: TagFormValues): void {
    const slug =
      values.slug ||
      values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    onSubmit({ ...values, slug });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <label htmlFor="tag-name" className="block text-sm font-medium text-on-surface">
          Tag name
        </label>
        <input
          id="tag-name"
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-error dark:text-error">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="tag-type" className="block text-sm font-medium text-on-surface">
          Type
        </label>
        <input
          id="tag-type"
          type="text"
          {...register("tagType")}
          placeholder="e.g. theme, mechanic"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="tag-colour" className="block text-sm font-medium text-on-surface">
          Colour
        </label>
        <input
          id="tag-colour"
          type="text"
          {...register("colour")}
          placeholder="#rrggbb"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export function TagManager({ tags }: Props) {
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const [panel, setPanel] = useState<Panel | null>(null);

  const grouped = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const key = tag.tagType ?? "uncategorised";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tag);
    return acc;
  }, {});

  async function handleSubmit(values: TagFormValues) {
    if (panel?.mode === "edit") {
      await updateTag.mutateAsync({ id: panel.tag.id, ...values });
    } else {
      await createTag.mutateAsync(values);
    }
    setPanel(null);
  }

  const isSubmitting = createTag.isPending || updateTag.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-on-surface">Tags</h4>
        <button
          type="button"
          onClick={() => setPanel({ mode: "create" })}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-primary"
        >
          Add tag
        </button>
      </div>

      {panel && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-on-surface">
            {panel.mode === "edit" ? `Edit: ${panel.tag.name}` : "New tag"}
          </p>
          <TagForm
            tag={panel.mode === "edit" ? panel.tag : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setPanel(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([type, typeTags]) => (
          <div key={type}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {type}
            </p>
            <div className="divide-y divide-gray-100 rounded-md border border-gray-200 bg-surface">
              {typeTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-800">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => setPanel({ mode: "edit", tag })}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
