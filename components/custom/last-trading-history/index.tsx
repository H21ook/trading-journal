import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { TradeEntry, TradeStatus } from '@/lib/types/trade';
import { ChevronRight, MoreHorizontal, Plus, Search, SquareCheck, SquarePen, SquareX, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react'
import AddTradeModal from '../modals/add-trade-modal';
import EditTradeModal from '../modals/edit-trade-modal';
import { useAccounts } from '@/components/providers/account-provider';
import { useReferences } from '@/components/providers/reference-data-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/utils/supabase/client';
import TablePagination from '../table-pagination';

const tablePageSize = 10;

const LastTradingHistory = () => {

    const { user } = useAuth();
    const { currentAccount } = useAccounts();
    const { rules, symbols } = useReferences();
    const [trades, setTrades] = useState<TradeEntry[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isTradeListCollapsed, setIsTradeListCollapsed] = useState(false)
    const [isEditTradeDialogOpen, setIsEditTradeDialogOpen] = useState(false)
    const [tradeToEdit, setTradeToEdit] = useState<TradeEntry | null>(null)
    const [isCloseTradeDialogOpen, setIsCloseTradeDialogOpen] = useState(false)
    const [tradeToClose, setTradeToClose] = useState<TradeEntry | null>(null)
    const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set())

    const systemRules = rules.filter(item => item.is_system);
    const getTrades = useCallback(async (page = 1, pageSize = 10) => {
        setIsLoading(true)
        try {
            const supabase = createClient();
            if (user) {
                const from = (page - 1) * pageSize
                const to = from + pageSize - 1

                // Нийт тоо авах
                const { count: rowsCount } = await supabase
                    .from('trades')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                setTotalCount(rowsCount || 0);

                const { data } = await supabase.from("trades")
                    .select()
                    .eq("user_id", user?.id)
                    .eq("account_id", currentAccount?.id)
                    .order("created_at", { ascending: false })
                    .range(from, to);

                console.log("trades ", data)
                setTrades(data as TradeEntry[]);
            } else {
                throw new Error("Unauthorized")
            }
        } catch (err) {

        } finally {
            setIsLoading(false)
        }
    }, [user]);

    useEffect(() => {
        getTrades(1, tablePageSize);
    }, [getTrades])

    const openCloseTradeDialog = (trade: TradeEntry) => {
        setTradeToClose(trade)
        setIsCloseTradeDialogOpen(true)
    }

    const [editTradeData, setEditTradeData] = useState({
        stopLossAmount: "",
        takeProfitAmount: "",
        quantity: "",
        notes: "",
    })

    const filteredTrades = trades.filter((trade) => {
        const symbol = symbols.find(item => item.id === trade.symbol_id);
        const matchesSearch =
            symbol?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            symbol?.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trade.note?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatus === "all" || trade.status === selectedStatus
        return matchesSearch && matchesStatus
    })

    const getProfitLossColor = (profitLoss?: number) => {
        if (!profitLoss) return "bg-muted text-muted-foreground"
        return profitLoss > 0
            ? "bg-green-500/20 text-green-400 border-green-500/30"
            : "bg-red-500/20 text-red-400 border-red-500/30"
    }

    // const openEditTradeDialog = (trade: TradeEntry) => {
    //     setTradeToEdit(trade)
    //     setEditTradeData({
    //         stopLossAmount: trade.stopLossAmount?.toString() || "",
    //         takeProfitAmount: trade.takeProfitAmount?.toString() || "",
    //         quantity: trade.quantity.toString(),
    //         notes: trade.notes,
    //     })
    //     setIsEditTradeDialogOpen(true)
    // }

    const toggleTradeExpansion = (tradeId: string) => {
        const newExpanded = new Set(expandedTrades)
        if (newExpanded.has(tradeId)) {
            newExpanded.delete(tradeId)
        } else {
            newExpanded.add(tradeId)
        }
        setExpandedTrades(newExpanded)
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search trades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-input border-border text-foreground"
                    />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                        <SelectItem value="all" className="text-popover-foreground">
                            All Trades
                        </SelectItem>
                        <SelectItem value="open" className="text-popover-foreground">
                            Open Positions
                        </SelectItem>
                        <SelectItem value="closed" className="text-popover-foreground">
                            Closed Positions
                        </SelectItem>
                    </SelectContent>
                </Select>
                <div className="hidden md:block">
                    <Button className="bg-primary hover:bg-primary/90" type="button" onClick={() => {
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Trade
                    </Button>
                </div>
            </div>

            <Collapsible open={!isTradeListCollapsed} onOpenChange={setIsTradeListCollapsed}>
                <div className="flex items-center justify-between mb-4">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:bg-muted">
                            <ChevronRight className={`w-4 h-4 transition-transform ${!isTradeListCollapsed ? "rotate-90" : ""}`} />
                            <span className="font-medium">Trades ({filteredTrades.length})</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                    <div className="rounded-md border border-border bg-card">
                        {/* Desktop table view - unchanged */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-muted/50">
                                        <TableHead className="text-card-foreground">Symbol</TableHead>
                                        <TableHead className="text-card-foreground text-center">Action Type</TableHead>
                                        <TableHead className="text-card-foreground text-center">Action</TableHead>
                                        {
                                            systemRules.map(item => {
                                                return (<TableHead key={`system_rule_${item.id}`} className="text-card-foreground text-center">{item.title}</TableHead>)
                                            })
                                        }
                                        <TableHead className="text-card-foreground text-center">RR</TableHead>
                                        <TableHead className="text-card-foreground text-center">Status</TableHead>
                                        <TableHead className="text-card-foreground">Date</TableHead>
                                        <TableHead className="text-card-foreground w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTrades.map((trade) => {
                                        const symbol = symbols.find(item => item.id === trade.symbol_id)
                                        return (
                                            <TableRow key={trade.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="font-medium text-card-foreground">
                                                    <div className="flex items-center gap-2">
                                                        {symbol?.symbol}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='uppercase text-center'>
                                                    {trade.action_type}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <Badge variant="outline" className="text-xs gap-2">
                                                        {trade.action === "buy" ? (
                                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                                        ) : (
                                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                                        )}
                                                        {trade.action.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                {
                                                    systemRules.map(item => {
                                                        return (<TableCell key={`cell_rule_${item.id}`}>
                                                            <div className='flex justify-center w-full'>{trade.rule_ids.includes(item.id) ? <SquareCheck className='text-green-500' /> : <SquareX className='text-destructive' />}</div>
                                                        </TableCell>)
                                                    })
                                                }
                                                <TableCell className="text-muted-foreground text-sm text-center">
                                                    1:{trade.risk_to_reward}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <Badge
                                                        className={`text-xs ${trade.status === "open"
                                                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                            : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        {trade.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(trade.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-popover border-border">
                                                            {trade.status === TradeStatus.OPEN && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        className="text-popover-foreground cursor-pointer"
                                                                    // onClick={() => openEditTradeDialog(trade)}
                                                                    >
                                                                        <SquarePen className="w-4 h-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-popover-foreground cursor-pointer"
                                                                        onClick={() => openCloseTradeDialog(trade)}
                                                                    >
                                                                        <X className="w-4 h-4 mr-2" />
                                                                        Close
                                                                    </DropdownMenuItem>
                                                                    {/* {trade.stopLossAmount !== trade.entryPrice && (
                                                                        <DropdownMenuItem
                                                                            className="text-popover-foreground cursor-pointer"
                                                                            onClick={() => moveSLToBreakEven(trade)}
                                                                        >
                                                                            Move SL to BE
                                                                        </DropdownMenuItem>
                                                                    )} */}
                                                                </>
                                                            )}
                                                            {
                                                                trade.status === TradeStatus.CLOSED ? <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem> : null
                                                            }

                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* <div className="md:hidden space-y-3 p-4">
                            {filteredTrades.map((trade) => (
                                <Card key={trade.id} className="bg-muted/20 border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-card-foreground">{trade.symbol}</span>
                                                {trade.action === "buy" ? (
                                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {trade.action.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={`text-xs ${trade.status === "open"
                                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {trade.status.toUpperCase()}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleTradeExpansion(trade.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronRight
                                                        className={`w-4 h-4 transition-transform ${expandedTrades.has(trade.id) ? "rotate-90" : ""
                                                            }`}
                                                    />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Qty:</span>
                                                <span className="ml-1 text-card-foreground">{trade.quantity}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Entry:</span>
                                                <span className="ml-1 text-card-foreground">${trade.entryPrice.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">P&L:</span>
                                                {trade.profitLoss !== undefined ? (
                                                    <span
                                                        className={`ml-1 font-medium ${trade.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                                                    >
                                                        ${trade.profitLoss.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="ml-1 text-muted-foreground">-</span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="ml-1 text-card-foreground">{new Date(trade.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {expandedTrades.has(trade.id) && (
                                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Take Profit:</span>
                                                        <span className="ml-1 text-card-foreground">
                                                            {trade.takeProfitAmount ? `$${trade.takeProfitAmount.toFixed(2)}` : "-"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Stop Loss:</span>
                                                        <span className="ml-1 text-card-foreground">
                                                            {trade.stopLossAmount ? `$${trade.stopLossAmount.toFixed(2)}` : "-"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Exit Price:</span>
                                                        <span className="ml-1 text-card-foreground">
                                                            {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "-"}
                                                        </span>
                                                    </div>
                                                    {trade.closureType && (
                                                        <div>
                                                            <span className="text-muted-foreground">Closed:</span>
                                                            <span className="ml-1 text-card-foreground">{trade.closureType}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {trade.emotions && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Emotions:</span>
                                                        <span className="ml-1 text-blue-400">{trade.emotions}</span>
                                                    </div>
                                                )}

                                                {trade.hashtags && trade.hashtags.length > 0 && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Strategy:</span>
                                                        <span className="ml-1 text-green-400">{trade.hashtags.join(" ")}</span>
                                                    </div>
                                                )}

                                                {trade.rulesFollowed && trade.rulesFollowed.length > 0 && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Rules Followed:</span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {trade.rulesFollowed.map((ruleId) => {
                                                                const rule = rules.find((r) => r.id === ruleId)
                                                                return rule ? (
                                                                    <Badge key={ruleId} variant="outline" className="text-xs">
                                                                        <CheckSquare className="w-3 h-3 mr-1" />
                                                                        {rule.title}
                                                                    </Badge>
                                                                ) : null
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {trade.notes && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Notes:</span>
                                                        <p className="mt-1 text-card-foreground">{trade.notes}</p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                    {trade.status === "open" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => openEditTradeDialog(trade)}
                                                                variant="outline"
                                                                className="flex-1 border-border text-foreground hover:bg-muted"
                                                            >
                                                                <Edit3 className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => openCloseTradeDialog(trade)}
                                                                className="flex-1 bg-primary hover:bg-primary/90"
                                                            >
                                                                Close
                                                            </Button>
                                                            {trade.stopLossAmount !== trade.entryPrice && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => moveSLToBreakEven(trade)}
                                                                    className="flex-1 border-border text-foreground hover:bg-muted"
                                                                >
                                                                    SL to BE
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div> */}


                    </div>
                    <TablePagination totalCount={totalCount} pageSize={tablePageSize} onChangePage={getTrades} />
                </CollapsibleContent>
            </Collapsible>

            {/* Empty state */}
            {filteredTrades.length === 0 && (
                <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No trades found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm || selectedStatus !== "all"
                            ? "No trades match your search criteria."
                            : "Start tracking your trades by adding your first position."}
                    </p>
                </div>
            )}

            <div className="fixed bottom-6 right-6 md:hidden">
                <Button size="lg" className="rounded-full shadow-lg bg-primary hover:bg-primary/90 h-14 w-14" type="button" onClick={() => {
                    setIsDialogOpen(true);
                }}>
                    <Plus className="w-6 h-6" />
                </Button>
            </div>

            <AddTradeModal open={isDialogOpen} onHide={() => {
                setIsDialogOpen(false);
            }} />

            {setIsEditTradeDialogOpen && <EditTradeModal open={isEditTradeDialogOpen} onHide={() => {
                setIsEditTradeDialogOpen(false);
            }} tradeData={editTradeData} />}
        </div>
    )
}

export default LastTradingHistory