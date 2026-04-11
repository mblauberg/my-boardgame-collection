type ErrorStatePanelProps = {
  title: string;
  description: string;
};

export function ErrorStatePanel({ title, description }: ErrorStatePanelProps) {
  return (
    <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
    </div>
  );
}
