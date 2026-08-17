import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Filter, RefreshCw } from "lucide-react";
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
  income: string;
  incomeFrom: string;
  time: string;
}

function MagicLevelIncomePage() {
  const { id } = Route.useSearch();
  const [level, setLevel] = useState("");
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
    const matchesSearch = search
      ? row.incomeFrom.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesLevel && matchesSearch;
  });

  const columns: Column<MagicLevelIncomeRow>[] = [
    {
      key: "level",
      label: "Level",
      render: (r) => (
        <span className="text-blue-600 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
          Level {r.level}
        </span>
      ),
    },
    {
      key: "income",
      label: "Income",
      render: (r) => (
        <span className="text-green-500 font-medium">{r.income}</span>
      ),
    },
    { key: "incomeFrom", label: "Income from" },
    { key: "time", label: "Time" },
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

      {loading ? (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading Level Income
          history...
        </div>
      ) : (
        <DataTable<MagicLevelIncomeRow>
          columns={columns}
          data={filteredData}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      )}
    </PageLayout>
  );
}
