import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Filter, RefreshCw, Clock } from "lucide-react";
import PageHeader from "@/components/page-header";
import FilterSection from "@/components/filter-section";
import DataTable, { type Column } from "@/components/data-table";
import PageLayout from "@/layouts/page-layout";
import {
  fetchLevelIncomeHistory,
  PreviewModeApiCall,
} from "@/lib/auth-api";

export const Route = createFileRoute("/preview/_income/magic-level")({
  component: MagicLevelIncomePage,
});

interface MagicLevelIncomeRow {
  id: number;
  level: number;
  package_id: number | null;
  income: string;
  incomeFrom: string;
  time: string;
}

function MagicLevelIncomePage() {
  const { id } = Route.useSearch();
  const [level, setLevel] = useState("");
  const [packageId, setPackageId] = useState("");
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userNumericId, setUserNumericId] = useState("Loading...");
  const [data, setData] = useState<MagicLevelIncomeRow[]>([]);

  useEffect(() => {
    if (!id) return; 
    const userId = id;
    async function loadData() {
      try {
        setLoading(true);

        setUserNumericId(userId);

        const history = await PreviewModeApiCall(
          userId,
          fetchLevelIncomeHistory,
        );
        const formattedData: MagicLevelIncomeRow[] = (history ?? []).map(
          (item, index) => ({
            id: index,
            level: item.level,
            package_id: item.package_id ?? 0,
            income: item.amount,
            incomeFrom: item.childId,
            time: item.date,
          }),
        );
        setData(formattedData);
      } catch (err) {
        console.error("Failed to load level income data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Filter logic based on selected level and search input
  const filteredData = data.filter((row) => {
    const matchesLevel = level ? row.level === Number(level) : true;
    const matchesPackages = packageId
      ? row.package_id === Number(packageId)
      : true;
    const matchesSearch = search
      ? row.incomeFrom.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesLevel && matchesSearch && matchesPackages;
  });

  const columns: Column<MagicLevelIncomeRow>[] = [
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
      key: "package_id",
      label: "Package",
      render: (r) => (
        <span className="text-yellow-400 bg-yellow-500/15 px-2 py-1 rounded-full text-xs font-medium">
          Package {r.package_id}
        </span>
      ),
    },
    {
      key: "income",
      label: "Income",
      render: (r) => (
        <span className="text-green-500 font-semibold">{r.income}</span>
      ),
    },
    {
      key: "incomeFrom",
      label: "Income from",
      render: (r) => <span className="text-blue-400 font-medium">{r.incomeFrom}</span>,
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
      },
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Magic Level Income"
        id={userNumericId}
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
              key: "package_id",
              label: "Package",
              type: "select",
              value: packageId,
              onChange: setPackageId,
              options: Array.from({ length: 9 }, (_, i) => i + 1).map((n) => ({
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
            setPackageId("");
            setSearch("");
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading Level Income
          history...
        </div>
      ) : (
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
