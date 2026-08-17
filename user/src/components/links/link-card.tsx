import { HelpCircle, Copy } from "lucide-react";

export type LinkColor = "default" | "green" | "teal";

export interface LinkData {
  id: string | number;
  label: string;
  name?: string;
  url: string;
  color?: LinkColor;
}

const THEMES: Record<LinkColor, { bg: string; text: string; button: string }> = {
  default: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    button: "bg-indigo-500 hover:bg-indigo-600",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    button: "bg-indigo-500 hover:bg-indigo-600",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    button: "bg-indigo-500 hover:bg-indigo-600",
  },
};

interface LinkCardProps {
  label: string;
  name?: string;
  url: string;
  color?: LinkColor;
}

// Single card
function LinkCard({ label = "Personal link", name, url, color = "default" }: LinkCardProps) {
  const theme = THEMES[color] ?? THEMES.default;

  const handleCopy = () => {
    navigator.clipboard?.writeText(url);
  };

  return (
    <div className={`rounded-2xl p-5 flex items-center justify-between ${theme.bg}`}>
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
          <span>{label}</span>
          {name && <span className={`font-medium ${theme.text}`}>{name}</span>}
          <HelpCircle size={14} className="text-gray-500" />
        </div>
        <div className={`text-xl font-bold ${theme.text}`}>{url}</div>
      </div>

      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${theme.button}`}
      >
        Copy
        <Copy size={14} />
      </button>
    </div>
  );
}

interface LinkCardListProps {
  links: LinkData[];
}

// Data ke according map krne wala wrapper — ye hi apne page me use hoga
export default function LinkCardList({ links }: LinkCardListProps) {
  return (
    <div className="space-y-4 mt-8">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          label={link.label}
          name={link.name}
          url={link.url}
          color={link.color}
        />
      ))}
    </div>
  );
}

export { LinkCard };