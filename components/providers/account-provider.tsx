"use client";

import { Account } from '@/lib/types/account'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

const AccountContext = createContext<{
    accounts: Account[],
    changeAccount?: (accounId: number) => void,
    currentAccount?: Account
}>({
    accounts: [],
    changeAccount: (accountId: number) => { }
})
const AccountProvider = ({ children, accounts, isNoAccounts = false }: {
    accounts: Account[],
    isNoAccounts: boolean
    children: ReactNode
}) => {

    const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(accounts[0]?.id);

    const changeAccount = useCallback((accountId: number) => {
        setSelectedAccountId(accountId)
    }, [])

    // useEffect(() => {
    //     if (accounts?.length > 0 && !selectedAccountId) {
    //         const firstAccount = accounts[0];
    //         setSelectedAccountId(firstAccount.id)
    //     }
    // }, [accounts, selectedAccountId])

    const currentAccount = accounts.find(item => item.id === selectedAccountId);
    console.log(currentAccount)
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