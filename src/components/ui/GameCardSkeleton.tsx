export function GameCardSkeleton() {
  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/2] bg-surface-container" />
      <div className="p-6 space-y-4">
        <div className="h-7 bg-surface-container rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-surface-container rounded" />
          <div className="h-4 bg-surface-container rounded w-5/6" />
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-5 bg-surface-container rounded w-20" />
          <div className="h-5 bg-surface-container rounded w-20" />
        </div>
      </div>
    </article>
  );
}
