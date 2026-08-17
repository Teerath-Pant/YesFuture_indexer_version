export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "select" | "text";
  value: string;
  onChange: (value: string) => void;
  options?: FilterOption[]; // for type "select"
  placeholder?: string; // for type "text"
}

export interface FilterSectionProps {
  fields: FilterField[];
  onApply: () => void;
  onReset: () => void;
}

export default function FilterSection({
  fields = [],
  onApply,
  onReset,
}: FilterSectionProps) {
  return (
    <div className="mb-6 rounded-2xl bg-[#212123c9] p-6">
      {/* 3-Column Grid Layout for Fields + Action Buttons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Dynamic Fields */}
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className={`appearance-none rounded-lg bg-[#3A3B3C] hover:bg-[#555657] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none`}
              >
                <option className="bg-[#3A3B3C] accent-[#555657]" value=""></option>
                {field.options?.map((opt) => (
                  <option className="bg-[#3A3B3C] py-5" key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                placeholder={field.placeholder}
                className="rounded-lg bg-[#3A3B3C] border px-4 py-2.5 text-white placeholder-gray-500 focus:bg-transparent focus:border-blue-600 focus:outline-none"
              />
            )}
          </div>
        ))}

        {/* Buttons Action Cell (Fits inside the 3-column grid) */}
          <button
            onClick={onApply}
            className="flex-1 rounded-lg bg-indigo-600 h-12 self-end px-4 max-h py-2.5 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Apply filters
          </button>
          <button
            onClick={onReset}
            className="flex-1 rounded-lg bg-[#3A3B3C] h-12 self-end hover:bg-[#555657] px-4 py-2.5 font-semibold text-white transition-colors"
          >
            Reset filters
          </button>
        </div>
    </div>
  );
}