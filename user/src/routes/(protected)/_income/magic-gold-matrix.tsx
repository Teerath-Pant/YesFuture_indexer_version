import DataTable, { type Column } from "@/components/data-table";
import FilterSection from "@/components/filter-section";
import PageHeader from "@/components/page-header";
import WalletCell from "@/components/wallet-cell";
import PageLayout from "@/layouts/page-layout";
import { fetchMatrixIncomeByAddress, fetchPackageAndId } from "@/lib/auth-api";
import { useWallet } from "@/lib/use-wallet";
import { createFileRoute } from "@tanstack/react-router";
import { Filter, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/(protected)/_income/magic-gold-matrix")({
  component: RouteComponent,
});

interface TransactionRow {
  id: number;
  date: string;
  refId: string;
  level: number;
  packageId: number;
  wallet: string;
  fullWallet?: string;
  type: "join" | "recycle";
  recycleCount?: number;
  amount: string;
}

function RouteComponent() {
  const { address: connectedWallet } = useWallet();
  const [pageTitle, _setPageTitle] = useState("Magic Gold Matrix Income");
  const [pageId, _setPageId] = useState<string | undefined>(undefined);
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
  const [data, setData] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [packageValue, setPackageValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_userNumericId, setUserNumericId] = useState("0");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLevel, setAppliedLevel] = useState("");
  const [appliedPackage, setAppliedPackage] = useState("");

  const columns: Column<TransactionRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID From",
      render: (r) => (
        <span className="text-blue-400 font-medium px-2 py-1 rounded-full">
          {r.refId}
        </span>
      ),
    },
    { key: "level", label: "Level" },
    { key: "packageId", label: "Package" },
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
      key: "amount",
      label: "USDT",
      align: "right",
      render: (r) => (
        <span className="text-green-400 font-semibold">{r.amount}</span>
      ),
    },
  ];

  useEffect(() => {
    if (!connectedWallet) {
      setData([]);
      return;
    }
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { numericId } = await fetchPackageAndId(connectedWallet);
        setUserNumericId(numericId);
        const historyData = await fetchMatrixIncomeByAddress(connectedWallet);
        console.log("History Data:", historyData);
        if (isMounted && historyData) {
          const formattedHistory: TransactionRow[] = historyData.map(
            (item: any, idx: number) => ({
              id: idx + 1,
              date: item.time,
              refId: item.fromId,
              level: Number(item.level) || 0,
              packageId: Number(item.packageId) || 0,
              wallet: `${connectedWallet.substring(0, 6)}...${connectedWallet.substring(connectedWallet.length - 4)}`,
              fullWallet: connectedWallet,
              type: "join",
              amount: item.amount,
            }),
          );
          setData(formattedHistory);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [connectedWallet]);

  const filteredData = useMemo(() => {
    let result = data;

    if (appliedLevel) {
      result = result.filter((row) => row.level === Number(appliedLevel));
    }

    if (appliedPackage) {
  result = result.filter((row) => row.packageId === Number(appliedPackage));
}
    if (appliedSearch.trim()) {
      const query = appliedSearch.trim().toLowerCase();
      result = result.filter(
        (row) =>
          row.refId?.toLowerCase().includes(query) ||
          row.wallet?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [
    data,
    appliedLevel,
    appliedSearch,
    appliedPackage
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={pageTitle}
        id={pageId ?? undefined}
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
              options: [1, 2, 3, 4, 5].map((n) => ({
                label: String(n),
                value: String(n),
              })),
            },
            {
              key: "package",
              label: "Package",
              type: "select",
              value: packageValue,
              onChange: setPackageValue,
              options: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
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
          onApply={() => {
            setAppliedPackage(packageValue);
            setAppliedSearch(search);
            setAppliedLevel(level);
          }}
          onReset={() => {
            setLevel("");
            setSearch("");
            setPackageValue("");
            setAppliedSearch("");
            setAppliedLevel("");
          }}
        />
      )}
      {isLoading && (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading ...
        </div>
      )}
      {!isLoading && (
        <div className="my-8">
          <DataTable<TransactionRow>
            columns={columns}
            data={filteredData}
            getRowKey={(row) => row.id}
            pageSize={10}
          />
        </div>
      )}
    </PageLayout>
  );
}
