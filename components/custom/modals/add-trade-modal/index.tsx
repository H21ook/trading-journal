"use client";

import { useAccounts } from '@/components/providers/account-provider';
import { useReferences } from '@/components/providers/reference-data-provider';
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Account } from '@/lib/types/account';
import { NewEntry, Symbol, TradeEntry, TradingRule } from '@/lib/types/trade';
import { CheckSquare, Hash } from 'lucide-react'
import React, { useState } from 'react'
import { SymbolSelector } from '../../symbol-selector';
import { Checkbox } from '@/components/ui/checkbox';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { CheckedState } from '@radix-ui/react-checkbox';

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

const AddTradeModal = ({
    open,
    onHide = () => { }
}: {
    open: boolean,
    onHide: () => void
}) => {
    const { symbols } = useReferences();
    const { currentAccount } = useAccounts();

    const { control, handleSubmit } = useForm<{
        emotion: string,
        rules: string[]
        riskToReward?: string,
        action: string
    }>({
        defaultValues: {
            emotion: emotionOptions[0],
            rules: [],
            riskToReward: "2",
            action: "buy"
        }
    })
    const [selectedRules, setSelectedRules] = useState<string[]>([])
    const [tradeEmotions, setTradeEmotions] = useState("")
    const [tradeHashtags, setTradeHashtags] = useState("")
    const rules: any[] = initialRules;

    const [newTrade, setNewTrade] = useState<NewEntry>({
        symbol: symbols?.[0]?.symbol,
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

    const handleAddTrade = (values: FieldValues) => {
        // if (!newTrade.symbol.trim() || !newTrade.quantity || !newTrade.entryPrice) return

        // const hashtags = tradeHashtags
        //     .split(/[,\s]+/)
        //     .filter((tag) => tag.trim())
        //     .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))

        // // Calculate position size and risk
        // const entryPrice = Number.parseFloat(newTrade.entryPrice)
        // const quantity = Number.parseFloat(newTrade.quantity)
        // const stopLoss = newTrade.stopLossAmount ? Number.parseFloat(newTrade.stopLossAmount) : undefined

        // const trade: TradeEntry = {
        //     id: Date.now().toString(),
        //     accountId: currentAccount!.id,
        //     symbol: newTrade.symbol.toUpperCase(),
        //     action: newTrade.action,
        //     quantity: quantity,
        //     entryPrice: entryPrice,
        //     takeProfitAmount: newTrade.takeProfitAmount ? Number.parseFloat(newTrade.takeProfitAmount) : undefined,
        //     stopLossAmount: stopLoss,
        //     date: new Date().toISOString().split("T")[0],
        //     notes: newTrade.notes,
        //     status: "open", // Always create as open
        //     rulesFollowed: selectedRules,
        //     emotions: tradeEmotions,
        //     hashtags: hashtags,
        //     riskRewardRatio: newTrade.riskRewardRatio,
        // }

        console.log("new trade ", values)
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
            <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">Add New Trade</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Record a new trading position for {currentAccount?.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <Controller
                        name="rules"
                        control={control}
                        render={({ field: { onChange, value } }) => {
                            const handleCheck = (checked: CheckedState, id: string) => {
                                if (checked) {
                                    if (id === "all") {
                                        onChange(rules.map(rule => rule.id))
                                    } else {
                                        onChange([...value, id])
                                    }
                                    return;
                                }
                                if (id === "all") {
                                    onChange([])
                                } else {
                                    onChange(
                                        value?.filter(
                                            (val) => val !== id
                                        )
                                    )
                                }
                            }
                            return (<div>
                                <Label className="text-card-foreground font-medium flex items-center gap-2 mb-2">
                                    Trading Rules Checklist
                                </Label>

                                <div className="grid grid-cols-1 rounded-lg bg-background">
                                    <div className='border-b p-2 pb-1'>
                                        <div className='flex items-center gap-3 transition-all hover:bg-muted/50 py-1.5 px-2 rounded-sm cursor-pointer' onClick={() => {
                                            const checked = rules.length !== value.length;
                                            handleCheck(checked, "all")
                                        }}>
                                            <Checkbox
                                                checked={value.length === rules.length}
                                                onCheckedChange={() => { }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-card-foreground">Check all rules</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 gap-1 p-2 pt-1'>
                                        {rules
                                            .filter((rule) => rule.isActive)
                                            .map((rule) => (
                                                <div key={rule.id} className='flex items-center gap-3 transition-all hover:bg-muted/50 py-1.5 px-2 rounded-sm cursor-pointer' onClick={() => {
                                                    const checked = !value?.includes(rule.id);
                                                    handleCheck(checked, rule.id)
                                                }}>
                                                    <Checkbox
                                                        checked={value.includes(rule.id)}
                                                        onCheckedChange={() => { }}
                                                    />

                                                    <div>
                                                        <p className="text-sm font-medium text-card-foreground">{rule.title}</p>
                                                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>)
                        }}
                    />


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="symbol" className="text-card-foreground">
                                Symbol
                            </Label>
                            <SymbolSelector />
                        </div>
                        <Controller
                            control={control}
                            name="action"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <div>
                                        <Label htmlFor="action" className="text-card-foreground">
                                            Action
                                        </Label>
                                        <Select
                                            value={value}
                                            onValueChange={(e) => onChange(e)}
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
                                    </div>)
                            }} />
                    </div>

                    {/* <div className="grid grid-cols-2 gap-4">
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
                    </div> */}

                    {/* Risk/Reward ratio selection */}
                    <Controller
                        control={control}
                        name="riskToReward"
                        render={({ field: { value, onChange } }) => {
                            return (<div>
                                <Label htmlFor="riskToReward" className="text-card-foreground">
                                    Risk/Reward Ratio
                                </Label>
                                <div className='relative'>
                                    <Input
                                        id="riskToReward"
                                        type="number"
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        placeholder="Reward"
                                        className="bg-input border-border text-foreground pl-[30px]"
                                    />
                                    <div className='absolute inset-y-0 h-full flex items-center pl-3 pt-0.5 text-base md:text-sm'>1 :</div>
                                </div>
                            </div>)
                        }}
                    />



                    {/* <div className="grid grid-cols-2 gap-4">
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
                    </div> */}

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="emotion"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <div>
                                        <Label htmlFor="emotions" className="text-card-foreground">
                                            Emotions
                                        </Label>
                                        <Select value={value} onValueChange={onChange}>
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
                                    </div>)
                            }} />
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

                    <Button onClick={handleSubmit(handleAddTrade)} className="w-full bg-primary hover:bg-primary/90">
                        Add Trade
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default AddTradeModal