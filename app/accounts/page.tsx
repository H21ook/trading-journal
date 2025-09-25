"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building2, MoreHorizontal, ChevronLeft, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Account {
  id: string
  name: string
  type: "forex" | "stocks" | "crypto"
  initialDeposit: number
  currentBalance: number
  createdAt: string
}

interface TradeEntry {
  id: string
  accountId: string
  symbol: string
  action: "buy" | "sell"
  quantity: number
  entryPrice: number
  exitPrice?: number
  takeProfitAmount?: number
  stopLossAmount?: number
  date: string
  notes: string
  status: "open" | "closed"
  profitLoss?: number
  rulesFollowed?: string[]
  emotions?: string
  hashtags?: string[]
  riskRewardRatio?: "" | "1:1" | "1:2" | "1:3" | "1:5"
}

interface BalanceTransaction {
  id: string
  accountId: string
  type: "deposit" | "withdrawal" | "adjustment"
  amount: number
  balanceBefore: number
  balanceAfter: number
  notes?: string
  date: string
}

interface AppUser {
  email: string
  balance: number
}

export default function AccountsPage() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false)
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "stocks" as const,
    initialDeposit: "",
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        } else {
          router.push("/auth/login")
          return
        }

        const savedAccounts = localStorage.getItem("accounts")
        if (savedAccounts) {
          setAccounts(JSON.parse(savedAccounts))
        }

        const savedTrades = localStorage.getItem("trades")
        if (savedTrades) {
          setTrades(JSON.parse(savedTrades))
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

    setNewAccount({
      name: "",
      type: "stocks",
      initialDeposit: "",
    })
    setIsCreateAccountDialogOpen(false)
  }

  const handleEditAccount = () => {
    if (!editingAccount || !editingAccount.name.trim()) return

    const updatedAccounts = accounts.map((acc) => (acc.id === editingAccount.id ? editingAccount : acc))
    setAccounts(updatedAccounts)
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts))

    setEditingAccount(null)
    setIsEditAccountDialogOpen(false)
  }

  const handleDeleteAccount = (accountId: string) => {
    if (confirm("Are you sure you want to delete this account? This will also delete all associated trades.")) {
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountId)
      setAccounts(updatedAccounts)
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts))

      // Remove associated trades
      const updatedTrades = trades.filter((trade) => trade.accountId !== accountId)
      setTrades(updatedTrades)
      localStorage.setItem("trades", JSON.stringify(updatedTrades))

      // Remove balance history
      localStorage.removeItem(`balanceHistory_${accountId}`)
    }
  }

  const openEditDialog = (account: Account) => {
    setEditingAccount({ ...account })
    setIsEditAccountDialogOpen(true)
  }

  const getAccountStats = (accountId: string) => {
    const accountTrades = trades.filter((trade) => trade.accountId === accountId)
    const closedTrades = accountTrades.filter((trade) => trade.status === "closed")
    const openTrades = accountTrades.filter((trade) => trade.status === "open")

    const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
    const winningTrades = closedTrades.filter((trade) => (trade.profitLoss || 0) > 0)
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

    const totalInvested = openTrades.reduce((sum, trade) => sum + trade.entryPrice * trade.quantity, 0)

    return {
      totalTrades: accountTrades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      totalProfitLoss,
      winRate,
      totalInvested,
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="border-border text-foreground hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Trading Log
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Account Management</h1>
              <p className="text-muted-foreground">Manage your trading accounts and view performance</p>
            </div>
          </div>

          <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Create New Trading Account</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Set up a new account to organize your trades by strategy or market
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountName" className="text-card-foreground">
                    Account Name
                  </Label>
                  <Input
                    id="accountName"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="e.g., Day Trading, Long Term Investments"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="accountType" className="text-card-foreground">
                    Account Type
                  </Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value: "forex" | "stocks" | "crypto") =>
                      setNewAccount({ ...newAccount, type: value })
                    }
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
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Accounts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accounts.map((account) => {
            const stats = getAccountStats(account.id)
            const accountValue = account.currentBalance + stats.totalProfitLoss
            const returnPercentage = ((accountValue - account.initialDeposit) / account.initialDeposit) * 100

            return (
              <Card key={account.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-medium text-card-foreground">{account.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {account.type.toUpperCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem
                          className="text-popover-foreground cursor-pointer"
                          onClick={() => openEditDialog(account)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-xl font-bold text-card-foreground">
                        ${account.currentBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Value</p>
                      <p
                        className={`text-xl font-bold ${accountValue >= account.initialDeposit ? "text-green-400" : "text-red-400"}`}
                      >
                        ${accountValue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Return</p>
                      <p className={`text-lg font-medium ${returnPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {returnPercentage >= 0 ? "+" : ""}
                        {returnPercentage.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className={`text-lg font-medium ${stats.winRate >= 50 ? "text-green-400" : "text-red-400"}`}>
                        {stats.winRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-medium text-card-foreground">{stats.totalTrades}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Open</p>
                      <p className="text-sm font-medium text-blue-400">{stats.openTrades}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Closed</p>
                      <p className="text-sm font-medium text-card-foreground">{stats.closedTrades}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
                      onClick={() => router.push(`/?account=${account.id}`)}
                    >
                      View Trades
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
                      onClick={() => router.push(`/dashboard?account=${account.id}`)}
                    >
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Account Statistics Summary */}
        {accounts.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    ${accounts.reduce((sum, acc) => sum + acc.currentBalance, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Balance</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{accounts.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">Active Accounts</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{trades.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Trades</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {trades.filter((t) => t.status === "open").length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Open Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first trading account to start tracking your trades and performance.
            </p>
            <Button onClick={() => setIsCreateAccountDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Account
            </Button>
          </div>
        )}

        {/* Edit Account Dialog */}
        <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Edit Account</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update account details and settings
              </DialogDescription>
            </DialogHeader>
            {editingAccount && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editAccountName" className="text-card-foreground">
                    Account Name
                  </Label>
                  <Input
                    id="editAccountName"
                    value={editingAccount.name}
                    onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="editAccountType" className="text-card-foreground">
                    Account Type
                  </Label>
                  <Select
                    value={editingAccount.type}
                    onValueChange={(value: "forex" | "stocks" | "crypto") =>
                      setEditingAccount({ ...editingAccount, type: value })
                    }
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
                  <Label htmlFor="editInitialDeposit" className="text-card-foreground">
                    Initial Deposit
                  </Label>
                  <Input
                    id="editInitialDeposit"
                    type="number"
                    step="0.01"
                    value={editingAccount.initialDeposit}
                    onChange={(e) =>
                      setEditingAccount({ ...editingAccount, initialDeposit: Number.parseFloat(e.target.value) })
                    }
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <Button onClick={handleEditAccount} className="w-full bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
