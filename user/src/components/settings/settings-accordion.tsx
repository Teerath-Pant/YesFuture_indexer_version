import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface SettingsAccordionItem {
  id: string;
  label: string;
  description?: string;
  render: () => ReactNode;
}

interface SettingsAccordionProps {
  items: SettingsAccordionItem[];
}

export function SettingsAccordion({ items }: SettingsAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="w-full rounded-3xl border border-white/5 bg-[#1b1d22] overflow-hidden divide-y divide-white/5">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/3"
            >
              <div>
                <span className="text-sm font-semibold text-white">{item.label}</span>
                {item.description && (
                  <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <div className="px-5 pb-5 pt-1">{item.render()}</div>}
          </div>
        );
      })}
    </div>
  );
}