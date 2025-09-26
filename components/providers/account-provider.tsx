"use client";

import { Account } from '@/lib/types/account'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

const AccountContext = createContext<{
    accounts: Account[],
    changeAccount?: (accounId: string) => void,
    currentAccount?: Account
}>({
    accounts: []
})
const AccountProvider = ({ children, accounts }: {
    accounts: Account[],
    children: ReactNode
}) => {

    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();

    const changeAccount = useCallback((accountId: string) => {
        setSelectedAccountId(accountId)
    }, [])

    useEffect(() => {
        if (accounts?.length > 0 && !selectedAccountId) {
            const firstAccount = accounts?.[0];
            setSelectedAccountId(firstAccount.id)
        }
    }, [accounts, selectedAccountId])

    const currentAccount = accounts.find(item => item.id === selectedAccountId);
    return (
        <AccountContext.Provider value={{
            accounts,
            changeAccount,
            currentAccount
        }}>
            {children}
        </AccountContext.Provider>
    )
}

export default AccountProvider;

export const useAccounts = () => {
    return useContext(AccountContext);
}