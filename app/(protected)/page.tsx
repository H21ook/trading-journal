"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckSquare,
  Hash,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import StatCards from "@/components/custom/stat-cards"
import TradingRulesModal from "@/components/custom/modals/trading-rules-modal"
import SymbolManageModal from "@/components/custom/modals/symbol-manage-modal"
import ProfileDropdown from "@/components/custom/profile-dropdown"
import LastTradingHistory from "@/components/custom/last-trading-history"
import { useAccounts } from "@/components/providers/account-provider"
import AccountCreateForm from "@/components/custom/account-create-form/page"

export default function TradingJournal() {
  const { user } = useAuth();

  const { accounts, currentAccount, changeAccount } = useAccounts();
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false)
  const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false)

  // if (!currentAccount) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Redirect if no user (shouldn't happen due to useEffect, but safety check)
  if (!user) {
    return null
  }

  // Handle case where there are no accounts yet
  if (accounts.length === 0 && !currentAccount) {
    return <AccountCreateForm />
  }

  if (!currentAccount) {
    return null;
  }


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
          <Select value={currentAccount.id.toString()} onValueChange={(e) => {
            const val = Number(e);
            if (!isNaN(val)) {
              changeAccount?.(val)
            }
          }}>
            <SelectTrigger className="w-full sm:w-64 bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()} className="text-popover-foreground">
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

        <StatCards />

        {/* Search and Filter */}
        <LastTradingHistory />

        {/* Trading Rules Management Dialog */}
        <TradingRulesModal open={isRulesDialogOpen} onHide={() => {
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
