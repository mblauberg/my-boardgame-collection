export interface CategoryChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ label, isActive, onClick }: CategoryChipProps) {
  if (isActive) {
    return (
      <button 
        onClick={onClick}
        className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20">
        {label}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="px-6 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-semibold hover:bg-surface-container-highest transition-colors">
      {label}
    </button>
  );
}
