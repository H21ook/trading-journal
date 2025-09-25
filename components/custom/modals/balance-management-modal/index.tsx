"use client";

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Account, BalanceTransaction } from '@/lib/types/account'
import { Button } from '@/components/ui/button'

const BalanceManagementModal = ({
    open,
    onHide = () => { },
    currentAccount
}: {
    open: boolean,
    onHide: () => void,
    currentAccount: Account
}) => {
    const [newBalance, setNewBalance] = useState("")
    const [balanceTransactionType, setBalanceTransactionType] = useState<"deposit" | "withdrawal" | "adjustment">(
        "deposit",
    )

    const [balanceTransactionNotes, setBalanceTransactionNotes] = useState("")

    const handleBalanceChange = () => {
        if (!newBalance || Number.parseFloat(newBalance) <= 0) return

        const amount = Number.parseFloat(newBalance)
        const balanceBefore = currentAccount.currentBalance
        let balanceAfter: number

        switch (balanceTransactionType) {
            case "deposit":
                balanceAfter = balanceBefore + amount
                break
            case "withdrawal":
                if (amount > currentAccount.currentBalance) {
                    alert("Insufficient available balance for withdrawal")
                    return
                }
                balanceAfter = balanceBefore - amount
                break
            case "adjustment":
                balanceAfter = amount
                break
            default:
                return
        }

        // Create transaction record
        const transaction: BalanceTransaction = {
            id: Date.now().toString(),
            accountId: currentAccount.id,
            type: balanceTransactionType,
            amount: amount,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            notes: balanceTransactionNotes || undefined,
            date: new Date().toISOString(),
        }

        // Update account balance
        // const updatedAccount = { ...currentAccount!, currentBalance: balanceAfter }
        // const updatedAccounts = accounts.map((acc) => (acc.id === currentAccountId ? updatedAccount : acc))
        // setAccounts(updatedAccounts)
        // localStorage.setItem("accounts", JSON.stringify(updatedAccounts))

        // Update balance history
        // const updatedHistory = [transaction, ...balanceHistory]
        // setBalanceHistory(updatedHistory)
        // localStorage.setItem(`balanceHistory_${currentAccountId}`, JSON.stringify(updatedHistory))

        // setNewBalance("")
        // setBalanceTransactionNotes("")
        onHide();
    }

    return (
        <Dialog open={open} onOpenChange={(e) => {
            if (!e) {
                onHide()
            }
        }}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">Manage Account Balance</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Add or remove funds from {currentAccount.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label className="text-card-foreground">Transaction Type</Label>
                        <Select
                            value={balanceTransactionType}
                            onValueChange={(value: "deposit" | "withdrawal" | "adjustment") => setBalanceTransactionType(value)}
                        >
                            <SelectTrigger className="bg-input border-border text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="deposit" className="text-popover-foreground">
                                    Deposit
                                </SelectItem>
                                <SelectItem value="withdrawal" className="text-popover-foreground">
                                    Withdrawal
                                </SelectItem>
                                <SelectItem value="adjustment" className="text-popover-foreground">
                                    Balance Adjustment
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="balanceAmount" className="text-card-foreground">
                            {balanceTransactionType === "adjustment" ? "New Balance" : "Amount"}
                        </Label>
                        <Input
                            id="balanceAmount"
                            type="number"
                            step="0.01"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            placeholder="1000.00"
                            className="bg-input border-border text-foreground"
                        />
                    </div>

                    <div>
                        <Label htmlFor="balanceNotes" className="text-card-foreground">
                            Notes (optional)
                        </Label>
                        <Textarea
                            id="balanceNotes"
                            value={balanceTransactionNotes}
                            onChange={(e) => setBalanceTransactionNotes(e.target.value)}
                            placeholder="Reason for transaction..."
                            rows={2}
                            className="bg-input border-border text-foreground"
                        />
                    </div>

                    <div className="p-4 border border-border rounded-lg bg-muted/10">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Balance:</span>
                            <span className="text-card-foreground">${currentAccount.currentBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Available Balance:</span>
                            <span className="text-card-foreground">${currentAccount.currentBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleBalanceChange} className="flex-1 bg-primary hover:bg-primary/90">
                            Update Balance
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

export default BalanceManagementModal