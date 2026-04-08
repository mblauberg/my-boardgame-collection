import { useState } from "react";

type BuyPriorityFieldProps = {
  gameId: string;
  currentPriority: number | null;
  onSave: (gameId: string, priority: number | null) => void;
  disabled?: boolean;
};

export function BuyPriorityField({ gameId, currentPriority, onSave, disabled }: BuyPriorityFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentPriority?.toString() || "");

  const handleSave = () => {
    const priority = value === "" ? null : parseInt(value, 10);
    onSave(gameId, priority);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        disabled={disabled}
        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
      >
        Edit Priority
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border rounded px-2 py-1 w-20"
        disabled={disabled}
      />
      <button onClick={handleSave} disabled={disabled} className="text-sm text-green-600 hover:underline">
        Save
      </button>
      <button onClick={() => setIsEditing(false)} className="text-sm text-gray-600 hover:underline">
        Cancel
      </button>
    </div>
  );
}
