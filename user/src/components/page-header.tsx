// components/page-header.tsx

import {type ReactNode } from "react";

export interface HeaderAction {
  label: string;
  icon?: ReactNode;
  isOpen?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export interface PageHeaderProps {
  title: string;
  id?: string;
  label?:string;
  isFilterSectionShow?: boolean;
  actions?: HeaderAction[];
}

export default function PageHeader({ title, id,label, actions = [] }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-start gap-3 flex-col ">
        <div className="flex items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">{title}</h1>
        {id && (
          <span className="px-3 cursor-pointer rounded-full bg-[#1D2131] text-blue-600 text-[17px] font-base whitespace-nowrap">
            {id}
          </span>
        )}</div>
        {label && (
          <span className="px-2 py-1 cursor-pointer rounded bg-[#1f4cff93] text-white text-[17px] font-semibold whitespace-nowrap">{label}</span>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={
                "flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors not-even:whitespace-nowrap " +
                (action.variant === "primary"
                  ? action.isOpen
                    ? "bg-blue-600 text-white"
                    : "bg-[#1D2131] text-blue-600/80"
                  : action.isOpen
                    ? ""
                    : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700")
              }
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}