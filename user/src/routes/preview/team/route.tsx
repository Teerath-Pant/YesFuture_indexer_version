import { createFileRoute, useSearch } from "@tanstack/react-router";
import PageLayout from "@/layouts/page-layout";
import PageHeader from "@/components/page-header";
import WalletCell from "@/components/wallet-cell";
import { useEffect, useState } from "react";
import type { Column } from "@/components/data-table";
import DataTable from "@/components/data-table";
import { Filter, RefreshCw } from "lucide-react";
import FilterSection from "@/components/filter-section";
import { fetchTeamAllLevels, fetchPackageAndId, PreviewModeApiCall } from "@/lib/auth-api";

export const Route = createFileRoute("/preview/team")({
  component: RouteComponent,
});

export interface TeamRow {
  id: number;
  date: string;
  wallet: string;
  fullWallet?: string;
  refId: string;
  level: number;
  packageId: number;
  totalBussiness: number;
}

function RouteComponent() {
  const [userStringId, setUserStringId] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<TeamRow[]>([]);
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);

  const {id} = useSearch({from:"/preview"})

  useEffect(() => {
    async function init() {
      try {
        if (!id) {
          setError("Havn't userId");
          setIsLoading(false);
          return;
        }
        try {
          const pkgData = await PreviewModeApiCall(id,fetchPackageAndId);
          setUserStringId(pkgData?.stringId || "ID ...");
        } catch {
          setUserStringId("ID ...");
        }

        const rows = await PreviewModeApiCall(id,fetchTeamAllLevels);
        setData(rows ?? []);
      } catch (err) {
        console.error("Failed to load team:", err);
        setError("Failed to load team data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const filtered = data.filter((r) => {
    const matchesLevel = level ? r.level === Number(level) : true;
    const matchesSearch = search
      ? r.refId.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesLevel && matchesSearch;
  });

  const columns: Column<TeamRow>[] = [
    { key: "date", label: "Join Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-blue-500 font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-500/20 transition-colors">
        {r.refId}
        </span>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (r) => (
        <span className="text-purple-400 bg-purple-500/15 px-2 py-1 rounded-full text-xs font-medium">
          Level {r.level}
        </span>
      ),
    },
    {
      key: "packageId",
      label: "Package",
      render: (r) => (
        <span className="text-yellow-400 bg-yellow-500/15 px-2 py-1 rounded-full text-xs font-medium">
          Package {r.packageId}
        </span>
      ),
    },
    {
      key: "wallet",
      label: "Address",
      render: (r) => (
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}

        />
      ),
    },
    {
      key: "totalBussiness",
      label: "Total Bussiness",
      align: "center",
      render: (r) => (
        <span className="text-green-400 font-semibold"> ${r.totalBussiness}</span>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Team"
        id={userStringId}
        actions={[
          {
            label: "Filters",
            icon: <Filter size={16} />,
            variant: "primary",
            isOpen: isFilterSectionShow,
            onClick: () => setIsFilterSectionShow(!isFilterSectionShow),
          },
        ]}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

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
              placeholder: "Search...",
            },
          ]}
          onApply={() => setIsFilterSectionShow(false)}
          onReset={() => {
            setLevel("");
            setSearch("");
          }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading team...
        </div>
      ) : (
        <>
          <div className="text-gray-400 text-sm mb-4">
            Showing {filtered.length} of {data.length} records
            {level && ` • Filtered by Level ${level}`}
            {search && ` • Search: "${search}"`}
          </div>
          <DataTable<TeamRow>
            columns={columns}
            data={filtered}
            getRowKey={(row) => row.id}
            pageSize={10}
          />
        </>
      )}
    </PageLayout>
  );
}