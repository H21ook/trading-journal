"use client";

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Account } from '@/lib/types/account';
import { NewEntry, Symbol, TradeEntry } from '@/lib/types/trade';
import { CheckSquare, Hash } from 'lucide-react'
import React, { useState } from 'react'

const emotionOptions = [
    "Confident",
    "Anxious",
    "Greedy",
    "Fearful",
    "FOMO",
    "Patient",
    "Impatient",
    "Excited",
    "Calm",
    "Stressed",
    "Optimistic",
    "Cautious",
]

const AddTradeModal = ({
    open,
    onHide = () => { }
}: {
    open: boolean,
    onHide: () => void
}) => {
    const currentAccount: Account = {
        id: "2343215",
        name: "Test",
        type: "forex",
        initialDeposit: 100,
        currentBalance: 104,
        createdAt: "2025-04-23"
    }
    const [selectedRules, setSelectedRules] = useState<string[]>([])
    const [tradeEmotions, setTradeEmotions] = useState("")
    const [tradeHashtags, setTradeHashtags] = useState("")
    const rules: any[] = []
    const userSymbols: Symbol[] = [];
    const [newTrade, setNewTrade] = useState<NewEntry>({
        symbol: userSymbols?.[0]?.symbol,
        action: "buy",
        quantity: "",
        entryPrice: "",
        exitPrice: "", // Removed from new trade form as per updates
        takeProfitAmount: "",
        stopLossAmount: "",
        notes: "",
        riskRewardRatio: "" as "" | "1:1" | "1:2" | "1:3" | "1:5",
    })

    const calculateTakeProfit = (entryPrice: number, stopLoss: number, ratio: string, action: "buy" | "sell") => {
        if (!ratio || !entryPrice || !stopLoss) return ""

        const multiplier = Number.parseFloat(ratio.split(":")[1])
        const risk = Math.abs(entryPrice - stopLoss)
        const reward = risk * multiplier

        if (action === "buy") {
            return (entryPrice + reward).toFixed(2)
        } else {
            return (entryPrice - reward).toFixed(2)
        }
    }

    const handleRiskRewardChange = (ratio: "" | "1:1" | "1:2" | "1:3" | "1:5") => {
        setNewTrade({ ...newTrade, riskRewardRatio: ratio })

        if (ratio && newTrade.entryPrice && newTrade.stopLossAmount) {
            const calculatedTP = calculateTakeProfit(
                Number.parseFloat(newTrade.entryPrice),
                Number.parseFloat(newTrade.stopLossAmount),
                ratio,
                newTrade.action,
            )
            setNewTrade((prev) => ({ ...prev, takeProfitAmount: calculatedTP, riskRewardRatio: ratio }))
        }
    }

    const handleAddTrade = () => {
        if (!newTrade.symbol.trim() || !newTrade.quantity || !newTrade.entryPrice) return

        const hashtags = tradeHashtags
            .split(/[,\s]+/)
            .filter((tag) => tag.trim())
            .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))

        // Calculate position size and risk
        const entryPrice = Number.parseFloat(newTrade.entryPrice)
        const quantity = Number.parseFloat(newTrade.quantity)
        const stopLoss = newTrade.stopLossAmount ? Number.parseFloat(newTrade.stopLossAmount) : undefined

        const trade: TradeEntry = {
            id: Date.now().toString(),
            accountId: currentAccount.id,
            symbol: newTrade.symbol.toUpperCase(),
            action: newTrade.action,
            quantity: quantity,
            entryPrice: entryPrice,
            takeProfitAmount: newTrade.takeProfitAmount ? Number.parseFloat(newTrade.takeProfitAmount) : undefined,
            stopLossAmount: stopLoss,
            date: new Date().toISOString().split("T")[0],
            notes: newTrade.notes,
            status: "open", // Always create as open
            rulesFollowed: selectedRules,
            emotions: tradeEmotions,
            hashtags: hashtags,
            riskRewardRatio: newTrade.riskRewardRatio,
        }

        console.log("new trade ", trade)
        // const updatedTrades = [trade, ...trades]
        // setTrades(updatedTrades)
        // localStorage.setItem("trades", JSON.stringify(updatedTrades))

        // setNewTrade({
        //     symbol: "",
        //     action: "buy",
        //     quantity: "",
        //     entryPrice: "",
        //     exitPrice: "",
        //     takeProfitAmount: "",
        //     stopLossAmount: "",
        //     notes: "",
        //     riskRewardRatio: "",
        // })
        // setSelectedRules([])
        // setTradeEmotions("")
        // setTradeHashtags("")
        // onHide();
    }

    return (
        <Dialog open={open} onOpenChange={(e) => {
            if (!e) {
                onHide()
            }
        }}>
            <DialogContent className="bg-card border-border max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">Add New Trade</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Record a new trading position for {currentAccount.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-card-foreground font-medium flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Trading Rules Checklist
                        </Label>
                        <div className="grid grid-cols-1 gap-2 p-4 border border-border rounded-lg bg-muted/10">
                            {rules
                                .filter((rule) => rule.isActive)
                                .map((rule) => (
                                    <div key={rule.id} className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedRules.includes(rule.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRules([...selectedRules, rule.id])
                                                } else {
                                                    setSelectedRules(selectedRules.filter((id) => id !== rule.id))
                                                }
                                            }}
                                            className="mt-1"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-card-foreground">{rule.title}</p>
                                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="symbol" className="text-card-foreground flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Symbol
                            </Label>
                            <Select
                                value={newTrade.symbol}
                                onValueChange={(value) => setNewTrade({ ...newTrade, symbol: value })}
                            >
                                <SelectTrigger className="bg-input border-border text-foreground">
                                    <SelectValue placeholder="Select symbol" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    {userSymbols.map((symbol) => (
                                        <SelectItem key={symbol.id} value={symbol.symbol} className="text-popover-foreground">
                                            <div className="flex items-center justify-between w-full">
                                                <span>{symbol.symbol}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {symbol.type.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="action" className="text-card-foreground">
                                Action
                            </Label>
                            <Select
                                value={newTrade.action}
                                onValueChange={(value: "buy" | "sell") => setNewTrade({ ...newTrade, action: value })}
                            >
                                <SelectTrigger className="bg-input border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem value="buy" className="text-popover-foreground">
                                        Buy
                                    </SelectItem>
                                    <SelectItem value="sell" className="text-popover-foreground">
                                        Sell
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="quantity" className="text-card-foreground">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={newTrade.quantity}
                                onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                                placeholder="100"
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="entryPrice" className="text-card-foreground">
                                Entry Price
                            </Label>
                            <Input
                                id="entryPrice"
                                type="number"
                                step="0.01"
                                value={newTrade.entryPrice}
                                onChange={(e) => {
                                    setNewTrade({ ...newTrade, entryPrice: e.target.value })
                                    if (newTrade.riskRewardRatio && newTrade.stopLossAmount && e.target.value) {
                                        const calculatedTP = calculateTakeProfit(
                                            Number.parseFloat(e.target.value),
                                            Number.parseFloat(newTrade.stopLossAmount),
                                            newTrade.riskRewardRatio,
                                            newTrade.action,
                                        )
                                        setNewTrade((prev) => ({
                                            ...prev,
                                            entryPrice: e.target.value,
                                            takeProfitAmount: calculatedTP,
                                        }))
                                    }
                                }}
                                placeholder="150.25"
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                    </div>

                    {/* Risk/Reward ratio selection */}
                    <div>
                        <Label className="text-card-foreground">Risk/Reward Ratio</Label>
                        <Select value={newTrade.riskRewardRatio} onValueChange={handleRiskRewardChange}>
                            <SelectTrigger className="bg-input border-border text-foreground">
                                <SelectValue placeholder="Select ratio (auto-calculates TP)" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="1:1" className="text-popover-foreground">
                                    1:1 Risk/Reward
                                </SelectItem>
                                <SelectItem value="1:2" className="text-popover-foreground">
                                    1:2 Risk/Reward
                                </SelectItem>
                                <SelectItem value="1:3" className="text-popover-foreground">
                                    1:3 Risk/Reward
                                </SelectItem>
                                <SelectItem value="1:5" className="text-popover-foreground">
                                    1:5 Risk/Reward
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="stopLossAmount" className="text-card-foreground">
                                Stop Loss
                            </Label>
                            <Input
                                id="stopLossAmount"
                                type="number"
                                step="0.01"
                                value={newTrade.stopLossAmount}
                                onChange={(e) => {
                                    setNewTrade({ ...newTrade, stopLossAmount: e.target.value })
                                    if (newTrade.riskRewardRatio && newTrade.entryPrice && e.target.value) {
                                        const calculatedTP = calculateTakeProfit(
                                            Number.parseFloat(newTrade.entryPrice),
                                            Number.parseFloat(e.target.value),
                                            newTrade.riskRewardRatio,
                                            newTrade.action,
                                        )
                                        setNewTrade((prev) => ({
                                            ...prev,
                                            stopLossAmount: e.target.value,
                                            takeProfitAmount: calculatedTP,
                                        }))
                                    }
                                }}
                                placeholder="145.00"
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="takeProfitAmount" className="text-card-foreground">
                                Take Profit
                                {newTrade.riskRewardRatio && (
                                    <span className="text-xs text-muted-foreground ml-2">(Auto-calculated)</span>
                                )}
                            </Label>
                            <Input
                                id="takeProfitAmount"
                                type="number"
                                step="0.01"
                                value={newTrade.takeProfitAmount}
                                onChange={(e) => setNewTrade({ ...newTrade, takeProfitAmount: e.target.value })}
                                placeholder="160.00"
                                className="bg-input border-border text-foreground"
                                disabled={!!newTrade.riskRewardRatio}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="emotions" className="text-card-foreground">
                                Emotions
                            </Label>
                            <Select value={tradeEmotions} onValueChange={setTradeEmotions}>
                                <SelectTrigger className="bg-input border-border text-foreground">
                                    <SelectValue placeholder="Select emotion" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    {emotionOptions.map((emotion) => (
                                        <SelectItem key={emotion} value={emotion} className="text-popover-foreground">
                                            {emotion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="hashtags" className="text-card-foreground">
                                Strategy Tags
                            </Label>
                            <Input
                                id="hashtags"
                                value={tradeHashtags}
                                onChange={(e) => setTradeHashtags(e.target.value)}
                                placeholder="#breakout #trend-follow"
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notes" className="text-card-foreground">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={newTrade.notes}
                            onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                            placeholder="Trade reasoning, strategy, market analysis..."
                            rows={3}
                            className="bg-input border-border text-foreground"
                        />
                    </div>

                    <Button onClick={handleAddTrade} className="w-full bg-primary hover:bg-primary/90">
                        Add Trade
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddTradeModal