import DataTable, { type Column } from '@/components/data-table';
import FilterSection from '@/components/filter-section';
import PageHeader from '@/components/page-header';
import WalletCell from '@/components/wallet-cell';
import PageLayout from '@/layouts/page-layout'
import { fetchPackageAndId, fetchPurchaseHistory, getWalletAddressFromUserId, PreviewModeApiCall } from '@/lib/auth-api';
import { createFileRoute } from '@tanstack/react-router'
import { Filter, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/preview/_income/magic-gold-matrix')({
  component: RouteComponent,
})

interface TransactionRow {
  id: number;
  date: string;
  refId: string;
  level: number;
  wallet: string;
  fullWallet?: string;
  type: "join" | "recycle";
  recycleCount?: number;
  amount: string;
}

function RouteComponent() {
  const { id } = Route.useSearch();
  const [pageTitle, setPageTitle] = useState("Magic Gold Matrix Income");
  // const [pageId, setPageId] = useState<string | undefined>(undefined);
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
  const [data, setData] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userNumericId, setUserNumericId] = useState("0");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLevel, setAppliedLevel] = useState("");

  const columns: Column<TransactionRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
          ID {r.refId}
        </span>
      ),
    },
    { key: "level", label: "Package Level" },
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
      render: (r) => <span className="text-white">{r.amount}</span>,
    },
  ];

  useEffect(() => {
    if (!id) {
      setData([]);
      return;
    }
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const packageAndIdResult = await PreviewModeApiCall(id, fetchPackageAndId);
        if (!packageAndIdResult) {
          // handle null case — return, throw, ya default value set karo
          console.error("Failed to fetch package and id");
          return;
        }
        // setUserNumericId(numericId);

        const walletAddress = await getWalletAddressFromUserId(id)
        const historyData = await PreviewModeApiCall(id, fetchPurchaseHistory);
        if (isMounted && historyData && walletAddress) {
          const formattedHistory: TransactionRow[] = historyData.map((item: any, idx: number) => ({
            id: idx + 1,
            date: item.date,
            refId: packageAndIdResult.stringId,
            level: Number(item.packageId) || 1,
            wallet: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
            fullWallet: walletAddress,
            type: "join",
            amount: item.amount
          }));
          setData(formattedHistory);
          setIsLoading(false);
        }
      }
      catch (err) { console.error("Error fetching stats:", err); }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const filteredData = useMemo(() => {
    let result = data;

    if (appliedLevel) {
      result = result.filter((row) => row.level === Number(appliedLevel));
    }

    if (appliedSearch.trim()) {
      const query = appliedSearch.trim().toLowerCase();
      result = result.filter(
        (row) =>
          row.refId?.toLowerCase().includes(query) ||
          row.wallet?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [data, appliedLevel, appliedSearch]);

  return (
    <PageLayout>
      <PageHeader
        title={pageTitle}
        id={id ?? undefined}
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
              options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
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
            setAppliedSearch(search);
            setAppliedLevel(level);
          }}
          onReset={() => {
            setLevel("");
            setSearch("");
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
      {!isLoading && <div className="my-8">
        <DataTable<TransactionRow>
          columns={columns}
          data={filteredData}
          getRowKey={(row) => row.id}
          pageSize={10}
        />
      </div>}
    </PageLayout>
  )
}
