import { StateMessagePanel } from "./StateMessagePanel";

type ErrorStatePanelProps = {
  className?: string;
  title: string;
  description: string;
};

export function ErrorStatePanel({ className, title, description }: ErrorStatePanelProps) {
  return (
    <StateMessagePanel
      tone="error"
      title={title}
      description={description}
      align="center"
      className={className}
    />
  );
}
