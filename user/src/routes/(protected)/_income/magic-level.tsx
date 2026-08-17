// src/routes/(protected)/_income/magic-level.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Filter, RefreshCw, Clock } from "lucide-react";
import PageHeader from "@/components/page-header";
import FilterSection from "@/components/filter-section";
import DataTable, { type Column } from "@/components/data-table";
import PageLayout from "@/layouts/page-layout";
import {
  fetchLevelIncomeHistory,
  fetchPackageAndId,
} from "@/lib/auth-api";
import { ethers } from "ethers";

export const Route = createFileRoute("/(protected)/_income/magic-level")({
  component: MagicLevelIncomePage,
});

interface MagicLevelIncomeRow {
  id: number;
  level: number;
  income: string;
  incomeFrom: string;
  time: string;
}

function MagicLevelIncomePage() {
  const [level, setLevel] = useState("");
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userStringId, setUserStringId] = useState("Loading...");
  const [data, setData] = useState<MagicLevelIncomeRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        if (!window.ethereum) {
          setError("Please install MetaMask");
          setLoading(false);
          return;
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length === 0) {
          setError("Please connect your wallet");
          setLoading(false);
          return;
        }
        
        const walletAddress = accounts[0].address;
        // console.log("🔑 Wallet Address:", walletAddress);

        // 1. Fetch user's string ID
        try {
          const pkgData = await fetchPackageAndId(walletAddress);
          setUserStringId(pkgData.stringId || "ID ...");
          // console.log("📛 User String ID:", pkgData.stringId);
        } catch (err) {
          console.warn("Could not fetch member string ID:", err);
          setUserStringId("ID ...");
        }

        // 2. Fetch level income history
        const history = await fetchLevelIncomeHistory(walletAddress);

        // 3. Format the data for the table
        const formattedData: MagicLevelIncomeRow[] = history.map((item, index) => ({
          id: index + 1,
          level: item.level,
          income: item.amount,
          incomeFrom: item.childId,
          time: item.date || "Pending"
        }));

        setData(formattedData);

      } catch (err) {
        console.error("❌ Failed to load level income data:", err);
        setError("Failed to load income data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter logic
  const filteredData = data.filter((row) => {
    const matchesLevel = level ? row.level === Number(level) : true;
    const matchesSearch = search ? row.incomeFrom.toLowerCase().includes(search.toLowerCase()) : true;
    return matchesLevel && matchesSearch;
  });

  const columns: Column<MagicLevelIncomeRow>[] = [
    {
      key: "level",
      label: "Level",
      render: (r) => (
        <span className="text-blue-600 bg-indigo-500/15 px-2 py-1 rounded-full text-xs font-medium">
          Level {r.level}
        </span>
      ),
    },
    {
      key: "income",
      label: "Income",
      render: (r) => <span className="text-green-500 font-semibold">{r.income}</span>,
    },
    { 
      key: "incomeFrom", 
      label: "Income from",
      render: (r) => <span className="text-blue-400 font-medium">{r.incomeFrom}</span>
    },
    { 
      key: "time", 
      label: "Time",
      render: (r) => {
        // Check if time is valid
        if (r.time && r.time !== "Pending" && r.time !== "undefined" && r.time !== "") {
          return <span className="text-gray-300">{r.time}</span>;
        }
        return (
          <span className="flex items-center gap-1 text-yellow-500 text-xs">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      }
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Magic Level Income"
        id={userStringId}
        actions={[
          {
            label: "Filters",
            icon: <Filter size={16} />,
            variant: "primary",
            isOpen: isFilterSectionShow,
            onClick: () => {
              setIsFilterSectionShow(!isFilterSectionShow);
            },
          },
        ]}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filter Section */}
      {isFilterSectionShow && (
        <FilterSection
          fields={[
            {
              key: "level",
              label: "Level",
              type: "select",
              value: level,
              onChange: setLevel,
              options: Array.from({ length: 10 }, (_, i) => i + 1).map((n) => ({
                label: String(n),
                value: String(n),
              })),
            },
            {
              key: "search",
              label: "Search ID",
              type: "text",
              value: search,
              onChange: setSearch,
              placeholder: "Search by MT ID...",
            },
          ]}
          onApply={() => setIsFilterSectionShow(false)}
          onReset={() => {
            setLevel("");
            setSearch("");
          }}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading Level Income history...
        </div>
      // ) : data.length === 0 ? (
      //   // Empty State
      //   <div className="bg-[#1a1a2e] rounded-xl border border-gray-700 p-12 text-center">
      //     <div className="text-6xl mb-4">💰</div>
      //     <h3 className="text-white text-xl font-semibold mb-2">No Level Income Yet</h3>
      //     <p className="text-gray-400 max-w-md mx-auto">
      //       When your referrals purchase packages, you'll earn level income here.
      //     </p>
      //     <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 max-w-md mx-auto">
      //       <p className="text-yellow-500 text-sm">
      //         💡 Tip: Refer members and help them purchase packages to earn level income!
      //       </p>
      //     </div>
      //   </div>
      ) : (
        // Data Table
        <>
          <div className="text-gray-400 text-sm mb-4">
            Showing {filteredData.length} of {data.length} records
            {level && ` • Filtered by Level ${level}`}
            {search && ` • Search: "${search}"`}
          </div>
          <DataTable<MagicLevelIncomeRow>
            columns={columns}
            data={filteredData}
            getRowKey={(row) => row.id}
            pageSize={10}
          />
        </>
      )}
    </PageLayout>
  );
}