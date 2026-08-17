import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: LayoutProps) {
  return (
    <div className="pt-6">
        {children}
    </div>
  );
}