// src/components/not-found.tsx
import { Link } from "@tanstack/react-router";

export function NotFoundComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-7xl font-bold text-white">404</h1>
      <p className="text-gray-400">This page din't exist</p>
      <Link to="/" className="text-blue-500 underline">
        Home
      </Link>
    </div>
  );
}