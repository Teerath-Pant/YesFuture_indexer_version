import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/page-header";
import FilterSection from "@/components/filter-section";
import DataTable, { type Column } from "@/components/data-table";
import PageLayout from "@/layouts/page-layout";
import WalletCell from "@/components/wallet-cell";
import { useWallet } from "@/lib/use-wallet";
import { fetchDirectPartners, fetchPackageAndId } from "@/lib/auth-api";
import { Filter, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/(protected)/partners")({
  component: PartnerPage,
});

export interface PartnerRow {
  id: number;
  date: string;
  wallet: string;
  fullWallet?: string;
  refId: string;
  x3: number;
  x4: number;
  xXx: number;
  xGold: number;
  xQore: number;
  maxQore: number;
  profitUSDT: string;
  profitBNB: string;
  newPartners: number;
  partners: number;
}

function PartnerPage() {
  const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
  const [level, setLevel] = useState("");
  const [program, setProgram] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PartnerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Partners");
  const [pageId, setPageId] = useState<string | undefined>(undefined);
  const [appliedSearch, setAppliedSearch] = useState("");

  const { address: connectedWallet } = useWallet();

  useEffect(() => {
    if (!connectedWallet) {
      setData([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetchDirectPartners(connectedWallet),
      fetchPackageAndId(connectedWallet),
    ])
      .then(([rows, profile]) => {
        console.log("row",rows)
        console.log("profile",profile)
        if (!isMounted) return;
        setData(rows);
        setPageTitle("Partners");
        setPageId(profile.stringId || (profile.numericId ? `ID ${profile.numericId}` : undefined));
      })
      .catch((error) => {
        console.error("Failed to load direct partners or profile:", error);
        if (isMounted) setData([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [connectedWallet]);

  const filteredData = useMemo(() => {
      if (!appliedSearch.trim()) return data;
  
      const query = appliedSearch.trim().toLowerCase();
  
      return data.filter((row) => {
        const matchesId = row.refId?.toLowerCase().includes(query);
        const matchesWallet =
          row.wallet?.toLowerCase().includes(query) ||
          row.fullWallet?.toLowerCase().includes(query);
  
        return matchesId || matchesWallet;
      });
    }, [data, appliedSearch]);

  const columns: Column<PartnerRow>[] = [
    { key: "date", label: "Date" },
    {
      key: "wallet",
      label: "Address",
      render: (r) => (
        <WalletCell
          address={r.fullWallet ?? r.wallet}
          displayAddress={r.wallet}
          explorerUrl={`https://bscscan.com/address/${r.fullWallet ?? r.wallet}`}
        />
      ),
    },
    {
      key: "refId",
      label: "ID",
      render: (r) => (
        <span className="text-blue-500 font-medium bg-blue-500/10 px-2.5 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-500/20 transition-colors">
          ID {r.refId}
        </span>
      ),
    },
    {
      key: "sponserMagic",
      label: "Sponser Magic",
      align: "center",
      render: (r) => <span className="font-bold text-gray-200">{r.x3}</span>,
    },
    {
      key: "magicGoldMatrix",
      label: "Magic Gold Matrix",
      align: "center",
      render: (r) => <span className="font-bold text-gray-200">{r.x4}</span>,
    },
    {
      key: "magicLevel",
      label: "Magic Level",
      align: "center",
      render: (r) => <span className="font-bold text-gray-200">{r.xXx}</span>,
    },
    {
      key: "profitUSDT",
      label: "Profit USDT",
      align: "center",
      render: (r) => <span className="font-bold text-white text-xs">{r.profitUSDT}</span>,
    },
    {
      key: "newPartners",
      label: "New partners",
      align: "center",
      render: (r) => <span className="font-bold text-gray-200">{r.newPartners}</span>,
    },
  ];
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
            // {
            //   key: "program",
            //   label: "Program",
            //   type: "select",
            //   value: program,
            //   onChange: setProgram,
            //   options: [
            //     { label: "sponserMagic", value: "sponserMagic" },
            //     { label: "magicGoldMatrix", value: "magicGoldMatrix" },
            //     { label: "magicLevel", value: "magicLevel" },
            //   ],
            // },
            // {
            //   key: "level",
            //   label: "Level",
            //   type: "select",
            //   value: level,
            //   onChange: setLevel,
            //   options: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
            //     label: String(n),
            //     value: String(n),
            //   })),
            // },
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
            console.log("apply", { program, level, search });
          }}
          onReset={() => {
            setProgram("");
            setLevel("");
            setSearch("");
            setAppliedSearch("");
          }}
        />
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-20 text-indigo-400">
          <RefreshCw className="animate-spin mr-2" /> Loading direct partners...
        </div>
      )}

     {!isLoading && <DataTable<PartnerRow>
        columns={columns}
        data={filteredData}
        getRowKey={(row) => row.id}
        pageSize={10}
      />}
    </PageLayout>
  );
}
