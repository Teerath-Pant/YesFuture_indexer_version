// import React from "react";
import { Link } from "@tanstack/react-router";
import { Users, RefreshCw, Wallet } from "lucide-react";

export interface PartnerSlot {
  id?: string;
  to?: string;
  searchId?: string;
  isHeld?: boolean; // income for this partner is escrowed, not paid out yet
}

export interface LevelSummaryCardProps {
  level: number;
  cycleNum?: number;
  id: string; // e.g. "206248"
  coinCount: number; // top-right coin icon value
  partners: PartnerSlot[]; // fixed length per program (e.g. 3 slots for x3)
  partnersCount: number;
  cyclesCount: number;
  totalRevenue: string; // e.g. "710 USDT"
}

export default function SponsorLevelSummaryCard({
  level,
  cycleNum,
  id,
  coinCount,
  partners,
  partnersCount,
  cyclesCount,
  totalRevenue,
}: LevelSummaryCardProps) {
  return (
    <div className="bg-linear-to-br from-[#406AFF] to-[#385fe9] rounded-2xl p-2 sm:p-6 shadow-lg shadow-indigo-500/20">
      {/* Top row */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-indigo-100/70 text-md sm:text-2xl font-semibold">Cycle {cycleNum ?? level}</span>
        <span className="text-white text-sm sm:text-lg font-bold">ID {id}</span>
        <span className="flex items-center gap-1.5 text-white font-semibold">
          <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[10px]">
            $
          </span>
          {coinCount}
        </span>
      </div>

      {/* Partner avatar slots */}
      <div className="flex justify-between sm:w-9/11 mx-auto mb-10">
        {partners.map((slot, i) =>
          slot.id ? (
            slot.to ? (
              <Link
                key={i}
                to={slot.to}
                search={{ id: slot.searchId }}
                className="sm:w-16 sm:h-16 h-12 w-12 rounded-full bg-white flex items-center justify-center text-[10px] sm:text-xs font-semibold text-neutral-900 hover:scale-105 transition-transform cursor-pointer"
                title={`View ID ${slot.id}'s stats`}
              >
                {slot.id}
              </Link>
            ) : (
              <div
                key={i}
                className="sm:w-16 sm:h-16 h-12 w-12 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-neutral-900"
              >
                {slot.id}
              </div>
            )
          ) : (
            <div key={i} className="sm:w-16 sm:h-16 h-12 w-12 rounded-full bg-white/25" />
          )
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-indigo-100/70 text-sm">Partners</span>
            <span className="flex items-center gap-1.5 text-white text-sm font-medium">
              <Users size={14} /> {partnersCount}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-indigo-100/70 text-sm">Cycles</span>
            <span className="flex items-center gap-1.5 text-white text-sm font-medium">
              {/* cyclesCount counts placements (1 = no recycle yet) — cycles are
                  displayed 0-indexed project-wide, so show completed recycles. */}
              <RefreshCw size={14} /> {Math.max(cyclesCount - 1, 0)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <span className="text-indigo-100/70 text-sm">Total level revenue</span>
          <span className="flex items-center gap-1.5 text-white text-sm font-medium">
            <Wallet size={14} /> {totalRevenue}
          </span>
        </div>
      </div>
    </div>
  );
}