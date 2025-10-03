"use client";

import { useAccounts } from '@/components/providers/account-provider';
import { useReferences } from '@/components/providers/reference-data-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NewEntry } from '@/lib/types/trade';
import React, { useState, useTransition } from 'react'
import { SymbolSelector } from '../../symbol-selector';
import { Checkbox } from '@/components/ui/checkbox';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { CheckedState } from '@radix-ui/react-checkbox';
import { createNewTrade } from '@/lib/actions/trade';

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
    const { symbols, rules } = useReferences();
    const { currentAccount } = useAccounts();
    const [isPending, startTransition] = useTransition();

    const { control, handleSubmit } = useForm<{
        emotion: string,
        rules: string[]
        actionType: string,
        riskToReward?: string,
        action: string,
        symbol: string
        note?: string
    }>({
        defaultValues: {
            emotion: emotionOptions[0],
            rules: [],
            actionType: "market",
            riskToReward: "2",
            action: "buy",
            note: "",
            symbol: symbols?.[0]?.id
        }
    })

    const [tradeHashtags, setTradeHashtags] = useState("")

    const [newTrade, setNewTrade] = useState<NewEntry>({
        symbol: symbols?.[0]?.id,
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
        if (!currentAccount) {
            return;
        }
        startTransition(async () => {
            const formData = new FormData();
            formData.append("accountId", currentAccount.id.toString());
            formData.append("symbolId", values.symbol)
            formData.append("actionType", values.actionType)
            formData.append("action", values.action)
            formData.append("riskToReward", values.riskToReward)
            formData.append("emotion", values.emotion)
            formData.append("note", values.note)
            values.rules?.forEach((rule: string) => {
                formData.append("rules[]", rule)
            })

            const res = await createNewTrade(formData);

            if (res.isOk) {
                onHide();
            } else {
                alert(res.error)
            }
        })


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
                                                <p className="select-none text-sm font-medium text-card-foreground">Check all rules</p>
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

                                                    <div className='select-none'>
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


                    <Controller
                        control={control}
                        name="symbol"
                        render={({ field: { value, onChange } }) => {
                            return (<div>
                                <Label htmlFor="symbol" className="text-card-foreground">
                                    Symbol
                                </Label>
                                <SymbolSelector value={value} onChange={onChange} />
                            </div>)
                        }} />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="actionType"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <div>
                                        <Label htmlFor="actionType" className="text-card-foreground">
                                            Action type
                                        </Label>
                                        <Select
                                            value={value}
                                            onValueChange={(e) => onChange(e)}
                                        >
                                            <SelectTrigger className="bg-input border-border text-foreground">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border">
                                                <SelectItem value="market" className="text-popover-foreground">
                                                    Market
                                                </SelectItem>
                                                <SelectItem value="limit" className="text-popover-foreground">
                                                    Limit
                                                </SelectItem>
                                                <SelectItem value="stop" className="text-popover-foreground">
                                                    Stop
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>)
                            }} />
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
                        {/* <div>
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
                        </div> */}
                    </div>

                    <Controller
                        control={control}
                        name="note"
                        render={({ field: { value, onChange } }) => {
                            return (
                                <div>
                                    <Label htmlFor="notes" className="text-card-foreground">
                                        Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        placeholder="Trade reasoning, strategy, market analysis..."
                                        rows={3}
                                        className="bg-input border-border text-foreground"
                                    />
                                </div>)
                        }} />

                    <Button disabled={isPending} onClick={handleSubmit(handleAddTrade)} className="w-full bg-primary hover:bg-primary/90">
                        {isPending ? "Creating..." : "Add Trade"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default AddTradeModal