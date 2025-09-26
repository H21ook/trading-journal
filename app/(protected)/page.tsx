"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckSquare,
  Hash,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { TradeEntry, TradingRule } from "@/lib/types/trade"
import StatCards from "@/components/custom/stat-cards"
import TradingRulesModal from "@/components/custom/modals/trading-rules-modal"
import SymbolManageModal from "@/components/custom/modals/symbol-manage-modal"
import ProfileDropdown from "@/components/custom/profile-dropdown"
import LastTradingHistory from "@/components/custom/last-trading-history"
import { useAccounts } from "@/components/providers/account-provider"
import AccountCreateForm from "@/components/custom/account-create-form/page"

const initialTrades: TradeEntry[] = [
  {
    id: "1",
    accountId: "1", // Added accountId
    symbol: "AAPL",
    action: "buy",
    quantity: 100,
    entryPrice: 150.25,
    exitPrice: 155.8,
    takeProfitAmount: 160.0,
    stopLossAmount: 145.0,
    date: "2024-01-15",
    notes: "Strong earnings report, good technical setup",
    status: "closed",
    profitLoss: 555,
  },
  {
    id: "2",
    accountId: "1", // Added accountId
    symbol: "TSLA",
    action: "buy",
    quantity: 50,
    entryPrice: 245.3,
    takeProfitAmount: 260.0,
    stopLossAmount: 235.0,
    date: "2024-01-14",
    notes: "Breakout above resistance, targeting $260",
    status: "open",
  },
]

// Initial trading rules
const initialRules: TradingRule[] = [
  {
    id: "1",
    title: "Always set SL/TP",
    description: "Every trade must have both stop loss and take profit levels defined",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    title: "Follow market structure",
    description: "Only trade in direction of higher timeframe trend",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    title: "Risk max 2% per trade",
    description: "Position size should not risk more than 2% of account balance",
    isActive: true,
    createdAt: "2024-01-01",
  },
]

export default function TradingJournal() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const { accounts, currentAccount, changeAccount } = useAccounts();

  const [newAccount, setNewAccount] = useState<{
    name: string,
    type: "forex" | "stocks" | "crypto",
    initialDeposit: string
  }>({
    name: "",
    type: "stocks",
    initialDeposit: "",
  })

  const [trades, setTrades] = useState<TradeEntry[]>(initialTrades)


  // State for trading rules management
  const [rules, setRules] = useState<TradingRule[]>(initialRules)
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false)

  const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {

        const savedTrades = localStorage.getItem("trades")
        if (savedTrades) {
          setTrades(JSON.parse(savedTrades))
        }

        const savedRules = localStorage.getItem("tradingRules")
        if (savedRules) {
          setRules(JSON.parse(savedRules))
        }

      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
        return
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Function to open edit trade dialog


  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if no user (shouldn't happen due to useEffect, but safety check)
  if (!user) {
    return null
  }

  // Handle case where there are no accounts yet
  if (accounts.length === 0) {
    return <AccountCreateForm />
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header with Profile Dropdown */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trading Journal</h1>
            <p className="text-muted-foreground">Track and analyze your trading performance</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRulesDialogOpen(true)}
              className="border-border text-foreground hover:bg-muted"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Rules</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSymbolDialogOpen(true)}
              className="border-border text-foreground hover:bg-muted"
            >
              <Hash className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Symbols</span>
            </Button>

            <ProfileDropdown />
          </div>
        </div>

        {/* Account Selection */}
        <div className="mb-6">
          <Select value={currentAccount!.id} onValueChange={changeAccount}>
            <SelectTrigger className="w-full sm:w-64 bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-popover-foreground">
                  <div className="flex items-center justify-between w-full">
                    <span>{account.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {account.type.toUpperCase()}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <StatCards />

        {/* Search and Filter */}
        <LastTradingHistory rules={rules} />

        {/* Trading Rules Management Dialog */}
        <TradingRulesModal rules={rules} open={isRulesDialogOpen} onHide={() => {
          setIsRulesDialogOpen(false)
        }} />

        {/* Symbols Management Dialog */}
        <SymbolManageModal open={isSymbolDialogOpen} onHide={() => {
          setIsSymbolDialogOpen(false)
        }} />
      </div>
    </div>
  )
}
