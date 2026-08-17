import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Esc key se bhi close ho jaye
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative bg-[#181822] rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-white text-lg font-bold">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Yahi wo jagah hai jahan koi bhi form/content children ki tarah render hoga */}
        {children}
      </div>
    </div>
  );
}