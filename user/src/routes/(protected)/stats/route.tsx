import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, User, RefreshCw, Send } from "lucide-react";
import PageHeader from "@/components/page-header";
import FilterSection from "@/components/filter-section";
import DataTable, {type Column } from "@/components/data-table";
import PageLayout from "@/layouts/page-layout";
import WalletCell from "@/components/wallet-cell";

export const Route = createFileRoute("/(protected)/stats")({
  component: StatsPage,
});

interface StatRow {
  id: number;
  date: string;
  refId: string;
  program: string;
  level: number;
  wallet: string;
  fullWallet?: string;
  type: "join" | "recycle" | "upline";
  profit: string;
}

function StatsPage() {
  const [program, setProgram] = useState("");
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("206248");

  const data: StatRow[] = [
    {
      id: 1,
      date: "2024.01.07 11:15",
      refId: "426804",
      program: "x4",
      level: 1,
      wallet: "0xb54d0...33F3E",
      type: "join",
      profit: "5 USDT",
    },
    {
      id: 2,
      date: "2023.02.03 06:02",
      refId: "226706",
      program: "x3",
      level: 2,
      wallet: "0xAD180...17ece",
      type: "recycle",
      profit: "recycle",
    },
    {
      id: 3,
      date: "2023.01.31 15:53",
      refId: "443491",
      program: "x4",
      level: 6,
      wallet: "0xca11e...8Fd3B",
      type: "upline",
      profit: "send to upline",
    }
  ];

  // condition yahi decide karti hai kaunsa icon dikhana hai
  const getRowIcon = (row: StatRow) => {
    if (row.type === "recycle") return <RefreshCw size={16} className="text-green-500" />;
    if (row.type === "upline") return <Send size={16} className="text-gray-400" />;
    return <User size={16} className="text-gray-300" />;
  };

  const columns: Column<StatRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-blue-400 px-2 py-1 rounded-full font-medium">
          {r.refId}
        </span>
      ),
    },
    { key: "program", label: "Program" },
    { key: "level", label: "Level" },
    {
      key: "wallet",
      label: "Wallet",
      render: (r) => (
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
        />
      ),
    },
    {
      key: "profit",
      label: "USDT / BNB profit",
      align: "right",
      render: (r) => (
        <span className={r.type === "recycle" ? "text-green-400 font-semibold" : "text-green-400 font-semibold"}>{r.profit}</span>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Stats"
        id="ID 206248"
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
              key: "program",
              label: "Program",
              type: "select",
              value: program,
              onChange: setProgram,
              options: [
                { label: "x3", value: "x3" },
                { label: "x4", value: "x4" },
              ],
            },
            {
              key: "level",
              label: "Level",
              type: "select",
              value: level,
              onChange: setLevel,
              options: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
                label: String(n),
                value: String(n),
              })),
            },
            {
              key: "search",
              label: "Search ID / address",
              type: "text",
              value: search,
              onChange: setSearch,
              placeholder: "Search...",
            },
          ]}
          onApply={() => console.log("apply", { program, level, search })}
          onReset={() => {
            setProgram("");
            setLevel("");
            setSearch("");
          }}
        />
      )}

      <DataTable<StatRow>
        columns={columns}
        data={data}
        getRowIcon={getRowIcon}
        getRowKey={(row) => row.id}
        pageSize={10}
      />
    </PageLayout>
  );
}
