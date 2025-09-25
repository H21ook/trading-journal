"use client";

import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { DollarSign, Key, LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Account } from '@/lib/types/account';
import BalanceManagementModal from '../modals/balance-management-modal';
import { useRouter } from 'next/navigation';

const ProfileDropdown = () => {
    const { user } = useAuth()
    const currentAccount: Account = {
        id: "2343215",
        name: "Test",
        type: "forex",
        initialDeposit: 100,
        currentBalance: 104,
        createdAt: "2025-04-23"
    }
    const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false)

    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("user")
        router.push("/auth/login")
    }
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
                        <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-medium">{user?.email}</div>
                                <div className="text-xs text-muted-foreground">
                                    ${currentAccount.currentBalance.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border w-56">
                    <DropdownMenuItem
                        className="text-popover-foreground cursor-pointer"
                        onClick={() => setIsBalanceDialogOpen(true)}
                    >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Change Balance
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-popover-foreground">
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-popover-foreground">
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <BalanceManagementModal open={isBalanceDialogOpen} onHide={() => {
                setIsBalanceDialogOpen(false);
            }} currentAccount={currentAccount} />
        </>
    )
}

export default ProfileDropdown