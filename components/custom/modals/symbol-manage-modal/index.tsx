"use client";

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Symbol } from '@/lib/types/trade'
import { Hash, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

const initialSymbols: Symbol[] = [
    { id: "1", symbol: "AAPL", name: "Apple Inc.", type: "stocks", createdAt: "2024-01-01" },
    { id: "2", symbol: "TSLA", name: "Tesla Inc.", type: "stocks", createdAt: "2024-01-01" },
    { id: "3", symbol: "EURUSD", name: "Euro/US Dollar", type: "forex", createdAt: "2024-01-01" },
    { id: "4", symbol: "BTCUSD", name: "Bitcoin/US Dollar", type: "crypto", createdAt: "2024-01-01" },
]

const SymbolManageModal = ({
    open,
    onHide = () => { }
}: {
    open: boolean,
    onHide: () => void
}) => {
    const [userSymbols, setUserSymbols] = useState<Symbol[]>(initialSymbols)
    const [newSymbol, setNewSymbol] = useState<Omit<Symbol, "id" | "createdAt">>({
        symbol: "",
        name: "",
        type: "stocks" as const,
    })

    const deleteSymbol = (symbolId: string) => {
        const updatedSymbols = userSymbols.filter((s) => s.id !== symbolId)
        setUserSymbols(updatedSymbols)
        localStorage.setItem("userSymbols", JSON.stringify(updatedSymbols))
    }

    const handleCreateSymbol = () => {
        if (!newSymbol.symbol.trim() || !newSymbol.name.trim()) return

        const symbol: Symbol = {
            id: Date.now().toString(),
            symbol: newSymbol.symbol.toUpperCase(),
            name: newSymbol.name,
            type: newSymbol.type,
            createdAt: new Date().toISOString().split("T")[0],
        }

        const updatedSymbols = [...userSymbols, symbol]
        setUserSymbols(updatedSymbols)
        localStorage.setItem("userSymbols", JSON.stringify(updatedSymbols))

        setNewSymbol({
            symbol: "",
            name: "",
            type: "stocks",
        })
        onHide();
    }
    return (
        <Dialog open={open} onOpenChange={(e) => {
            if (!e) {
                onHide()
            }
        }}>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground flex items-center gap-2">
                        <Hash className="w-5 h-5" />
                        Manage Trading Symbols
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Add and manage your trading instruments for quick selection
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Add New Symbol */}
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                        <h4 className="font-medium text-card-foreground">Add New Symbol</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="symbolCode" className="text-card-foreground">
                                    Symbol
                                </Label>
                                <Input
                                    id="symbolCode"
                                    value={newSymbol.symbol}
                                    onChange={(e) => setNewSymbol({ ...newSymbol, symbol: e.target.value.toUpperCase() })}
                                    placeholder="AAPL"
                                    className="bg-input border-border text-foreground"
                                />
                            </div>
                            <div>
                                <Label htmlFor="symbolType" className="text-card-foreground">
                                    Type
                                </Label>
                                <Select
                                    value={newSymbol.type}
                                    onValueChange={(value: "forex" | "stocks" | "crypto") =>
                                        setNewSymbol({ ...newSymbol, type: value })
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
                        </div>
                        <div>
                            <Label htmlFor="symbolName" className="text-card-foreground">
                                Full Name
                            </Label>
                            <Input
                                id="symbolName"
                                value={newSymbol.name}
                                onChange={(e) => setNewSymbol({ ...newSymbol, name: e.target.value })}
                                placeholder="Apple Inc."
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                        <Button onClick={handleCreateSymbol} className="w-full bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Symbol
                        </Button>
                    </div>

                    {/* Existing Symbols */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-card-foreground">Your Trading Symbols</h4>
                        {userSymbols.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No symbols yet. Add your first trading symbol above.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {userSymbols.map((symbol) => (
                                    <div
                                        key={symbol.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-card-foreground">{symbol.symbol}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {symbol.type.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{symbol.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Added: {new Date(symbol.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteSymbol(symbol.id)}
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button onClick={onHide} className="w-full bg-primary hover:bg-primary/90">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SymbolManageModal