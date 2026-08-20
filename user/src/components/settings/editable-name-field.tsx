import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface EditableNameFieldProps {
  currentName: string;
  onUpdate: (newName: string) => Promise<void>;
}

export function EditableNameField({
  currentName,
  onUpdate,
}: EditableNameFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setValue(currentName);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleUpdate = async () => {
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 32) {
      setError("Name must be 1-20 characters");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await onUpdate(trimmed);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
        <span className="text-sm text-white font-medium">
          {currentName || "Not set"}
        </span>
        <button
          type="button"
          onClick={startEdit}
          className="flex items-center gap-1.5 rounded-full bg-[#3865ff] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#325ce6]"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          autoFocus
          className="flex-1 w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-[#3865ff]"
        />
        <div className="flex flex-end self-end sm:self-center">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-full bg-[#3865ff] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#325ce6] disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Update"}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={isSaving}
            className="flex items-center justify-center rounded-full border border-white/10 p-2 text-gray-400 transition-colors hover:bg-white/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}
