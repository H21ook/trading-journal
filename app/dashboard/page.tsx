"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  BarChart3,
  Target,
  Calendar,
  DollarSign,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  ChevronLeft,
  Download,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  Pie,
} from "recharts"

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

interface AppUser {
  email: string
  balance: number
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"]

export default function DashboardPage() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [currentAccountId, setCurrentAccountId] = useState<string>("")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d")
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
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
        return
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || accounts.length === 0) {
    router.push("/")
    return null
  }

  const currentAccount = accounts.find((acc) => acc.id === currentAccountId) || accounts[0]
  const accountTrades = trades.filter((trade) => trade.accountId === currentAccountId)

  // Filter trades by time range
  const getFilteredTrades = () => {
    if (timeRange === "all") return accountTrades

    const now = new Date()
    const cutoffDate = new Date()

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "30d":
        cutoffDate.setDate(now.getDate() - 30)
        break
      case "90d":
        cutoffDate.setDate(now.getDate() - 90)
        break
      case "1y":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return accountTrades.filter((trade) => new Date(trade.date) >= cutoffDate)
  }

  const filteredTrades = getFilteredTrades()
  const closedTrades = filteredTrades.filter((trade) => trade.status === "closed")
  const openTrades = filteredTrades.filter((trade) => trade.status === "open")

  // Calculate KPIs
  const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
  const winningTrades = closedTrades.filter((trade) => (trade.profitLoss || 0) > 0)
  const losingTrades = closedTrades.filter((trade) => (trade.profitLoss || 0) < 0)
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0) / winningTrades.length
      : 0
  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0) / losingTrades.length)
      : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

  const totalInvested = openTrades.reduce((sum, trade) => sum + trade.entryPrice * trade.quantity, 0)
  const accountValue = currentAccount.currentBalance + totalProfitLoss
  const returnPercentage = ((accountValue - currentAccount.initialDeposit) / currentAccount.initialDeposit) * 100

  // Prepare chart data
  const prepareEquityCurveData = () => {
    const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let runningBalance = currentAccount.initialDeposit

    const data = [{ date: currentAccount.createdAt, balance: runningBalance, trade: 0 }]

    sortedTrades.forEach((trade, index) => {
      runningBalance += trade.profitLoss || 0
      data.push({
        date: trade.date,
        balance: runningBalance,
        trade: trade.profitLoss || 0,
      })
    })

    return data
  }

  const prepareMonthlyPnLData = () => {
    const monthlyData: { [key: string]: number } = {}

    closedTrades.forEach((trade) => {
      const month = new Date(trade.date).toISOString().slice(0, 7) // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + (trade.profitLoss || 0)
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pnl]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        pnl: pnl,
        positive: pnl >= 0,
      }))
  }

  const prepareSymbolPerformanceData = () => {
    const symbolData: { [key: string]: { trades: number; pnl: number } } = {}

    closedTrades.forEach((trade) => {
      if (!symbolData[trade.symbol]) {
        symbolData[trade.symbol] = { trades: 0, pnl: 0 }
      }
      symbolData[trade.symbol].trades += 1
      symbolData[trade.symbol].pnl += trade.profitLoss || 0
    })

    return Object.entries(symbolData)
      .map(([symbol, data]) => ({
        symbol,
        trades: data.trades,
        pnl: data.pnl,
        avgPnL: data.pnl / data.trades,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10)
  }

  const prepareRiskRewardData = () => {
    const rrData: { [key: string]: number } = {}

    closedTrades.forEach((trade) => {
      if (trade.riskRewardRatio) {
        rrData[trade.riskRewardRatio] = (rrData[trade.riskRewardRatio] || 0) + 1
      }
    })

    return Object.entries(rrData).map(([ratio, count]) => ({
      ratio,
      count,
      percentage: (count / closedTrades.length) * 100,
    }))
  }

  const equityCurveData = prepareEquityCurveData()
  const monthlyPnLData = prepareMonthlyPnLData()
  const symbolPerformanceData = prepareSymbolPerformanceData()
  const riskRewardData = prepareRiskRewardData()

  // Calculate additional metrics
  const maxDrawdown = () => {
    let peak = currentAccount.initialDeposit
    let maxDD = 0

    equityCurveData.forEach((point) => {
      if (point.balance > peak) peak = point.balance
      const drawdown = ((peak - point.balance) / peak) * 100
      if (drawdown > maxDD) maxDD = drawdown
    })

    return maxDD
  }

  const sharpeRatio = () => {
    if (closedTrades.length < 2) return 0

    const returns = closedTrades.map((trade) => ((trade.profitLoss || 0) / currentAccount.initialDeposit) * 100)
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    return stdDev > 0 ? avgReturn / stdDev : 0
  }

  const calculateConsistencyScore = () => {
    if (filteredTrades.length === 0) return 0

    let score = 0
    let maxScore = 0

    filteredTrades.forEach((trade) => {
      // Risk management (TP/SL)
      if (trade.takeProfitAmount && trade.stopLossAmount) score += 25
      maxScore += 25

      // Position sizing
      const positionSize = (trade.entryPrice * trade.quantity) / currentAccount.currentBalance
      if (positionSize <= 0.1) score += 20
      maxScore += 20

      // Plan execution
      if (trade.status === "closed" && trade.exitPrice) {
        const hitTP = trade.takeProfitAmount && Math.abs(trade.exitPrice - trade.takeProfitAmount) <= 0.5
        const hitSL = trade.stopLossAmount && Math.abs(trade.exitPrice - trade.stopLossAmount) <= 0.5
        if (hitTP || hitSL) score += 30
        else if (trade.profitLoss && trade.profitLoss > 0) score += 15
        maxScore += 30
      }

      // Documentation
      if (trade.notes && trade.notes.length > 10) score += 25
      maxScore += 25
    })

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  const consistencyScore = calculateConsistencyScore()
  const maxDrawdownValue = maxDrawdown()
  const sharpeRatioValue = sharpeRatio()

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
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Advanced performance metrics and insights</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={currentAccountId} onValueChange={setCurrentAccountId}>
              <SelectTrigger className="w-48 bg-input border-border text-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{currentAccount.name}</span>
                </div>
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

            <Select
              value={timeRange}
              onValueChange={(value: "7d" | "30d" | "90d" | "1y" | "all") => setTimeRange(value)}
            >
              <SelectTrigger className="w-32 bg-input border-border text-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{timeRange === "all" ? "All" : timeRange.toUpperCase()}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="7d" className="text-popover-foreground">
                  Last 7 days
                </SelectItem>
                <SelectItem value="30d" className="text-popover-foreground">
                  Last 30 days
                </SelectItem>
                <SelectItem value="90d" className="text-popover-foreground">
                  Last 90 days
                </SelectItem>
                <SelectItem value="1y" className="text-popover-foreground">
                  Last year
                </SelectItem>
                <SelectItem value="all" className="text-popover-foreground">
                  All time
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Return</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${returnPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                {returnPercentage >= 0 ? "+" : ""}
                {returnPercentage.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {returnPercentage >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                ${totalProfitLoss.toFixed(2)} total P&L
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${winRate >= 50 ? "text-green-400" : "text-red-400"}`}>
                {winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {winningTrades.length}W / {losingTrades.length}L of {closedTrades.length} trades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Profit Factor</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${profitFactor >= 1.5 ? "text-green-400" : profitFactor >= 1 ? "text-yellow-400" : "text-red-400"}`}
              >
                {profitFactor.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg Win: ${avgWin.toFixed(2)} | Avg Loss: ${avgLoss.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Sharpe Ratio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${sharpeRatioValue >= 1 ? "text-green-400" : sharpeRatioValue >= 0.5 ? "text-yellow-400" : "text-red-400"}`}
              >
                {sharpeRatioValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Risk-adjusted returns</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-card-foreground">{filteredTrades.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Trades</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-card-foreground">{openTrades.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Open Positions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${maxDrawdownValue <= 10 ? "text-green-400" : maxDrawdownValue <= 20 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {maxDrawdownValue.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Max Drawdown</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div
                  className={`text-lg font-bold ${consistencyScore >= 80 ? "text-green-400" : consistencyScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {consistencyScore}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Consistency</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-card-foreground">
                  {((totalInvested / currentAccount.currentBalance) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Capital Used</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-card-foreground">${accountValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Account Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Equity Curve */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f9fafb",
                      }}
                      formatter={(value: any, name: string) => [
                        name === "balance" ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}`,
                        name === "balance" ? "Account Balance" : "Trade P&L",
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly P&L */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPnLData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f9fafb",
                      }}
                      formatter={(value: any) => [`$${value.toFixed(2)}`, "P&L"]}
                    />
                    <Bar
                      dataKey="pnl"
                      fill={(entry: any) => (entry.positive ? "#10b981" : "#ef4444")}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Symbol Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Top Performing Symbols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {symbolPerformanceData.slice(0, 8).map((item, index) => (
                  <div key={item.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-card-foreground">{item.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.trades} trades
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${item.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${item.pnl.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">${item.avgPnL.toFixed(2)} avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk/Reward Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Target className="w-5 h-5" />
                Risk/Reward Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={riskRewardData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ ratio, percentage }) => `${ratio} (${percentage.toFixed(1)}%)`}
                    >
                      {riskRewardData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#f9fafb",
                      }}
                      formatter={(value: any, name: string) => [`${value} trades`, "Count"]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-card-foreground">Trading Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Trades:</span>
                    <span className="text-card-foreground">{filteredTrades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Winning Trades:</span>
                    <span className="text-green-400">{winningTrades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losing Trades:</span>
                    <span className="text-red-400">{losingTrades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open Positions:</span>
                    <span className="text-blue-400">{openTrades.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-card-foreground">Risk Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span
                      className={`${maxDrawdownValue <= 10 ? "text-green-400" : maxDrawdownValue <= 20 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {maxDrawdownValue.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sharpe Ratio:</span>
                    <span
                      className={`${sharpeRatioValue >= 1 ? "text-green-400" : sharpeRatioValue >= 0.5 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {sharpeRatioValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Factor:</span>
                    <span
                      className={`${profitFactor >= 1.5 ? "text-green-400" : profitFactor >= 1 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {profitFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consistency Score:</span>
                    <span
                      className={`${consistencyScore >= 80 ? "text-green-400" : consistencyScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {consistencyScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-card-foreground">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Deposit:</span>
                    <span className="text-card-foreground">${currentAccount.initialDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className="text-card-foreground">${currentAccount.currentBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Value:</span>
                    <span className="text-card-foreground">${accountValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Return:</span>
                    <span className={`${returnPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {returnPercentage >= 0 ? "+" : ""}
                      {returnPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
