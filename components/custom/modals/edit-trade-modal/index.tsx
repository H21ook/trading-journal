"use client";

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea';
import { TradeEntry } from '@/lib/types/trade'
import React, { useState } from 'react'

const EditTradeModal = ({
    open,
    onHide = () => { },
    tradeData
}: {
    open: boolean,
    onHide: () => void
    tradeData: {
        stopLossAmount: string,
        takeProfitAmount: string,
        quantity: string,
        notes: string,
    }
}) => {

    const [tradeToEdit, setTradeToEdit] = useState<TradeEntry | null>(null)
    const [editTradeData, setEditTradeData] = useState(tradeData)

    const handleEditTrade = () => {
        if (!tradeToEdit) return

        const updatedStopLoss = editTradeData.stopLossAmount ? Number.parseFloat(editTradeData.stopLossAmount) : undefined
        const updatedTakeProfit = editTradeData.takeProfitAmount
            ? Number.parseFloat(editTradeData.takeProfitAmount)
            : undefined
        const updatedQuantity = Number.parseFloat(editTradeData.quantity)

        const updatedTrade: TradeEntry = {
            ...tradeToEdit,
            stopLossAmount: updatedStopLoss,
            takeProfitAmount: updatedTakeProfit,
            quantity: updatedQuantity,
            notes: editTradeData.notes,
        }

        // const updatedTrades = trades.map((trade) => (trade.id === tradeToEdit.id ? updatedTrade : trade))
        // setTrades(updatedTrades)
        // localStorage.setItem("trades", JSON.stringify(updatedTrades))

        // setIsEditTradeDialogOpen(false)
        setTradeToEdit(null)
        setEditTradeData({ stopLossAmount: "", takeProfitAmount: "", quantity: "", notes: "" })
        onHide()
    }

    return (
        <Dialog open={open} onOpenChange={(e) => {
            if (!e) {
                onHide()
            }
        }}>
            <DialogContent className="bg-card border-border max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">Edit Open Trade</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Modify {tradeToEdit?.symbol} - {tradeToEdit?.action.toUpperCase()} {tradeToEdit?.quantity} @ $
                        {tradeToEdit?.entryPrice}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="editStopLoss" className="text-card-foreground">
                                Stop Loss
                            </Label>
                            <Input
                                id="editStopLoss"
                                type="number"
                                step="0.01"
                                value={editTradeData.stopLossAmount}
                                onChange={(e) => setEditTradeData({ ...editTradeData, stopLossAmount: e.target.value })}
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="editTakeProfit" className="text-card-foreground">
                                Take Profit
                            </Label>
                            <Input
                                id="editTakeProfit"
                                type="number"
                                step="0.01"
                                value={editTradeData.takeProfitAmount}
                                onChange={(e) => setEditTradeData({ ...editTradeData, takeProfitAmount: e.target.value })}
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="editQuantity" className="text-card-foreground">
                            Quantity
                        </Label>
                        <Input
                            id="editQuantity"
                            type="number"
                            value={editTradeData.quantity}
                            onChange={(e) => setEditTradeData({ ...editTradeData, quantity: e.target.value })}
                            className="bg-input border-border text-foreground"
                        />
                    </div>

                    <div>
                        <Label htmlFor="editNotes" className="text-card-foreground">
                            Notes
                        </Label>
                        <Textarea
                            id="editNotes"
                            value={editTradeData.notes}
                            onChange={(e) => setEditTradeData({ ...editTradeData, notes: e.target.value })}
                            rows={3}
                            className="bg-input border-border text-foreground"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleEditTrade} className="flex-1 bg-primary hover:bg-primary/90">
                            Update Trade
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onHide}
                            className="flex-1 border-border text-foreground hover:bg-muted"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditTradeModal