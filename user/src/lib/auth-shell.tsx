import React from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f1013] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo mark — same blue as rest of the app (#3865ff) */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center ">
            <img
              src="/logo.png"
              alt="Yes Future logo"
              style={{
                height: "clamp(100px, 8vh, 80px)",
                filter: "drop-shadow(0 0 20px rgba(230, 178, 60, 0.35))",
              }}
            />
          </div>
        </div>

        <div className="bg-[#1b1d22] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white text-center mb-1.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-400 text-center mb-7">{subtitle}</p>
          )}
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 px-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClasses =
  "w-full rounded-xl bg-[#212226] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/60 focus:bg-[#25262b]";

export const detectButtonClasses =
  "w-full flex items-center justify-center gap-2 rounded-xl bg-[#212123] hover:bg-[#2a2b30] border border-white/10 px-4 py-3 text-sm font-medium text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const primaryButtonClasses =
  "w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600";

export const linkButtonClasses =
  "text-blue-400 hover:text-blue-300 font-medium";
