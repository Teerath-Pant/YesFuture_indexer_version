import { useEffect, useRef, useState } from "react";
import { type PackageCardData } from "./package-card-selector";

interface PackageWheelSelectorProps {
  packages: PackageCardData[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const ITEM_HEIGHT = 84; // px — har card slot ki height, scroll snap isi se calculate hota hai
const VISIBLE_HEIGHT = ITEM_HEIGHT * 3; // ek time me 3 slots dikhenge (upar, center, neeche)

export default function PackageWheelSelector({
  packages,
  selectedId,
  onSelect,
}: PackageWheelSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialIndex = Math.max(
    0,
    packages.findIndex((p) => p.id === selectedId),
  );
  const [centerIndex, setCenterIndex] = useState(initialIndex);

  // mount hote hi selected item ko center me scroll kr do
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = initialIndex * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll hote waqt jo bhi card center ke sabse pass hai usko "active/raised" mark kr do
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(idx, 0), packages.length - 1);
    setCenterIndex((prev) => (prev === clamped ? prev : clamped));
  };

  const scrollToIndex = (idx: number) => {
    containerRef.current?.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Center band — jahan wala card "selected zone" me hoga wahan highlight border dikhega */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-2xl border-2 border-indigo-400/70 bg-indigo-500/5 z-0"
        style={{ height: ITEM_HEIGHT - 8 }}
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ height: VISIBLE_HEIGHT, scrollbarWidth: "none" }}
      >
        {/* top padding — taaki pehla card bhi center tak scroll ho sake */}
        <div style={{ height: ITEM_HEIGHT }} />

        {packages.map((pkg, idx) => {
          const isCenter = idx === centerIndex;
          return (
            <div
              key={pkg.id}
              className="snap-center flex items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
            >
              <button
                type="button"
                onClick={() => {
                  scrollToIndex(idx);
                  onSelect(pkg.id);
                }}
                className={`w-[88%] rounded-2xl px-5 py-3.5 flex items-center justify-between bg-linear-to-br ${pkg.color} transition-all duration-200 z-10 ${
                  isCenter ? "scale-100 opacity-100 shadow-xl" : "scale-90 opacity-40"
                }`}
              >
                <span className="text-white font-semibold text-sm">{pkg.label}</span>
                <span className="text-white font-bold text-sm">{pkg.amount}</span>
              </button>
            </div>
          );
        })}

        {/* bottom padding — taaki aakhri card bhi center tak scroll ho sake */}
        <div style={{ height: ITEM_HEIGHT }} />
      </div>
    </div>
  );
}