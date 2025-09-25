"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckSquare,
  Hash,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Account } from "@/lib/types/account"
import { TradeEntry, TradingRule } from "@/lib/types/trade"
import StatCards from "@/components/custom/stat-cards"
import TradingRulesModal from "@/components/custom/modals/trading-rules-modal"
import SymbolManageModal from "@/components/custom/modals/symbol-manage-modal"
import ProfileDropdown from "@/components/custom/profile-dropdown"
import LastTradingHistory from "@/components/custom/last-trading-history"


// Interface for balance transactions

const initialAccounts: Account[] = [
  {
    id: "1",
    name: "Main Stocks",
    type: "stocks",
    initialDeposit: 10000,
    currentBalance: 10000,
    createdAt: "2024-01-01",
  },
]

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

  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [currentAccountId, setCurrentAccountId] = useState<string>(initialAccounts[0]?.id || "")
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false)
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
        const savedAccounts = localStorage.getItem("accounts")
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts)
          setAccounts(parsedAccounts)
          if (parsedAccounts.length > 0) {
            setCurrentAccountId(parsedAccounts[0].id)
          }
        }

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

  const handleCreateAccount = () => {
    if (!newAccount.name.trim() || !newAccount.initialDeposit || Number.parseFloat(newAccount.initialDeposit) <= 0)
      return

    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name,
      type: newAccount.type,
      initialDeposit: Number.parseFloat(newAccount.initialDeposit),
      currentBalance: Number.parseFloat(newAccount.initialDeposit),
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedAccounts = [...accounts, account]
    setAccounts(updatedAccounts)
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts))

    // Set as current account if it's the first one
    if (accounts.length === 0) {
      setCurrentAccountId(account.id)
    }

    setNewAccount({
      name: "",
      type: "stocks",
      initialDeposit: "",
    })
    setIsCreateAccountDialogOpen(false)
  }

  // Function to handle account change
  const handleAccountChange = (accountId: string) => {
    setCurrentAccountId(accountId)
  }

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-card-foreground">Welcome to Trading Journal</CardTitle>
            <p className="text-muted-foreground">Create your first trading account to get started</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountName" className="text-card-foreground">
                Account Name
              </Label>
              <Input
                id="accountName"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="e.g., Main Stocks, Crypto Portfolio"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="accountType" className="text-card-foreground">
                Account Type
              </Label>
              <Select
                value={newAccount.type}
                onValueChange={(value: "forex" | "stocks" | "crypto") => setNewAccount({ ...newAccount, type: value })}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="stocks" className="text-popover-foreground">
                    Stocks
                  </SelectItem>
                  <SelectItem value="forex" className="text-popover-foreground">
                    Forex
                  </SelectItem>
                  <SelectItem value="crypto" className="text-popover-foreground">
                    Crypto
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="initialDeposit" className="text-card-foreground">
                Initial Deposit
              </Label>
              <Input
                id="initialDeposit"
                type="number"
                step="0.01"
                value={newAccount.initialDeposit}
                onChange={(e) => setNewAccount({ ...newAccount, initialDeposit: e.target.value })}
                placeholder="10000.00"
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button onClick={handleCreateAccount} className="w-full bg-primary hover:bg-primary/90">
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentAccount = accounts.find((acc) => acc.id === currentAccountId) || accounts[0]


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
          <Select value={currentAccountId} onValueChange={handleAccountChange}>
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

        <StatCards currentAccount={currentAccount} />

        {/* Search and Filter */}
        <LastTradingHistory currentAccount={currentAccount} rules={rules} />

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
