"use client"
import { useAccounts } from '@/components/providers/account-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Gauge, Target, Wallet } from 'lucide-react'
import React from 'react'

const StatCards = () => {
    const { currentAccount } = useAccounts();
    // const calculateConsistencyScore = () => {
    //     if (accountTrades.length === 0) return 0

    //     let score = 0
    //     let maxScore = 0

    //     accountTrades.forEach((trade) => {
    //         // Check if trade has both TP and SL (risk management)
    //         if (trade.takeProfitAmount && trade.stopLossAmount) {
    //             score += 25
    //         }
    //         maxScore += 25

    //         // Check position sizing consistency (not too large positions)
    //         const positionSize = (trade.entryPrice * trade.quantity) / currentAccount.currentBalance
    //         if (positionSize <= 0.1) {
    //             // Max 10% per position
    //             score += 20
    //         }
    //         maxScore += 20

    //         // Check if closed trades followed their plan
    //         if (trade.status === "closed" && trade.exitPrice) {
    //             const hitTP = trade.takeProfitAmount && Math.abs(trade.exitPrice - trade.takeProfitAmount) <= 0.5
    //             const hitSL = trade.stopLossAmount && Math.abs(trade.exitPrice - trade.stopLossAmount) <= 0.5

    //             if (hitTP || hitSL) {
    //                 score += 30 // Followed the plan
    //             } else if (trade.profitLoss && trade.profitLoss > 0) {
    //                 score += 15 // Profitable but didn't follow plan exactly
    //             }
    //             maxScore += 30
    //         }

    //         // Reward for having notes (shows planning)
    //         if (trade.notes && trade.notes.length > 10) {
    //             score += 25
    //         }
    //         maxScore += 25

    //         const activeRules = rules.filter((rule) => rule.isActive)
    //         if (activeRules.length > 0 && trade.rulesFollowed) {
    //             const ruleAdherence = trade.rulesFollowed.length / activeRules.length
    //             score += Math.round(ruleAdherence * 30) // Up to 30 points for following all rules
    //         }
    //         maxScore += 30
    //     })

    //     return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    // }

    // const consistencyScore = calculateConsistencyScore()
    const { consistencyScore, closedTrades, openTrades, totalProfitLoss, winningTrades, losingTrades } = {
        consistencyScore: 48,
        closedTrades: 3,
        openTrades: 1,
        totalProfitLoss: 234,
        winningTrades: 24,
        losingTrades: 9
    }

    const winRate = closedTrades > 0 ? ((closedTrades - losingTrades) / closedTrades) * 100 : 0


    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl md:text-2xl font-bold text-card-foreground">
                        ${currentAccount?.currentBalance?.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Available: ${currentAccount?.currentBalance.toLocaleString()}</p>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total P&L</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-xl md:text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                        {totalProfitLoss >= 0 ? "+" : ""}${totalProfitLoss.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">{closedTrades} trades closed</p>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Win Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-xl md:text-2xl font-bold ${winRate >= 50 ? "text-green-400" : "text-red-400"}`}>
                        {winRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {winningTrades}W/{losingTrades}L
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Consistency Score</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <div
                            className={`text-xl md:text-2xl font-bold ${consistencyScore >= 80
                                ? "text-green-400"
                                : consistencyScore >= 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                        >
                            {consistencyScore}%
                        </div>
                        <div className="flex-1">
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${consistencyScore >= 80
                                        ? "bg-green-400"
                                        : consistencyScore >= 60
                                            ? "bg-yellow-400"
                                            : "bg-red-400"
                                        }`}
                                    style={{ width: `${consistencyScore}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {consistencyScore >= 80 ? "Excellent" : consistencyScore >= 60 ? "Good" : "Needs work"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default StatCards