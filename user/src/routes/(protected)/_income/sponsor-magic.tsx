import DataTable, { type Column } from '@/components/data-table';
import FilterSection from '@/components/filter-section';
import PageHeader from '@/components/page-header';
import { sponsorMagicPackages } from '@/constants/programs';
import PageLayout from '@/layouts/page-layout'
import { fetchSponsorIncomeHistory } from '@/lib/auth-api';
import { useWallet } from '@/lib/use-wallet';
import { createFileRoute } from '@tanstack/react-router'
import { Filter, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/(protected)/_income/sponsor-magic')({
    component: RouteComponent,
})

interface TransactionRow {
    id: number;
    date: string;
    refId: string;
    package: number;
    wallet: string;
    fullWallet?: string;
    type: "join" | "recycle";
    recycleCount?: number;
    amount: string;
}

function RouteComponent() {
    const { address: connectedWallet } = useWallet();
    // const [, setPage] = useState(1);
    const [pageTitle, setPageTitle] = useState("Sponsor Magic Income");
    const [pageId, setPageId] = useState<string | undefined>(undefined);
    const [isFilterSectionShow, setIsFilterSectionShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [level, setLevel] = useState("");
    const [data, setData] = useState<TransactionRow[]>([]);

    const [appliedSearch, setAppliedSearch] = useState("");
    const [appliedLevel, setAppliedLevel] = useState("");

    const columns: Column<TransactionRow>[] = [
        { key: "date", label: "Date" },
        // {
        //     key: "refId",
        //     label: "ID",
        //     render: (r) => (
        //         <span className="text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-full text-xs">
        //             ID {r.refId}
        //         </span>
        //     ),
        // },
        { key: "package", label: "Package" },
        {
            key: "wallet",
            label: "Income From",
            render: (r) => (
                <span className="text-white">{r.wallet}</span>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            align: "right",
            render: (r) => (
                <span className={r.type === "recycle" ? "text-green-400 font-semibold" : "text-green-400 font-semibold"}>
                    {r.amount}
                </span>
            ),
        },
    ];

    const getPackageLevelFromAmount = (amountStr: string): number => {
        const numericAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
        if (isNaN(numericAmount) || numericAmount <= 0) return 1;

        const packagePrices = sponsorMagicPackages;
        const foundIndex = packagePrices.findIndex(
            (price) => Math.abs(price - numericAmount) < 0.05
        );
        return foundIndex !== -1 ? foundIndex + 1 : 1;
    };


    useEffect(() => {
        if (!connectedWallet) {
            setData([]);
            return;
        }
        let isMounted = true;
        const loadData = async () => {
            try {
                setIsLoading(true);
                const IncomeHistory = await fetchSponsorIncomeHistory(connectedWallet)

                // console.log("History Data:", IncomeHistory);
                if (isMounted && IncomeHistory) {
                    const formattedData: TransactionRow[] = IncomeHistory.map((item, index) => {
                        const pkgLevel = getPackageLevelFromAmount(item.amount);
                        return {
                            id: index + 1,
                            date: item.date || "Pending",
                            refId: item.childId.replace("ID ", ""),
                            package: pkgLevel,
                            wallet: item.childId,
                            fullWallet: "",
                            type: "join",
                            recycleCount: item.cycle || 0,
                            amount: item.amount
                        };
                    });
                    setData(formattedData);
                    setIsLoading(false);
                }

            }
            catch (err) { console.error("Error fetching stats:", err); }
        }
        loadData();
        return () => {
            isMounted = false;
        };
    }, [connectedWallet])





    const filteredData = useMemo(() => {
        let result = data;

        if (appliedLevel) {
            result = result.filter((row) => row.package === Number(appliedLevel));
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
                            key: "packages",
                            label: "Packages",
                            type: "select",
                            value: level,
                            onChange: setLevel,
                            options: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
                                label: String(n),
                                value: String(n),
                            })),
                        },
                        // {
                        //     key: "level",
                        //     label: "Level",
                        //     type: "select",
                        //     value: level,
                        //     onChange: setLevel,
                        //     options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
                        //         label: String(n),
                        //         value: String(n),
                        //     })),
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
