import AccountProvider from '@/components/providers/account-provider'
import AuthProvider from '@/components/providers/auth-provider'
import ReferenceDataProvider from '@/components/providers/reference-data-provider'
import { Account } from '@/lib/types/account'
import { Symbol, Rule } from '@/lib/types/trade'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'

const ProtectedLayout = async ({ children }: { children: ReactNode }) => {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/auth/login')
    }

    const { data: accounts, error: accountError } = await supabase
        .from("accounts")
        .select()
        // .eq("userId", data.user.id)
        .order("createdAt", { ascending: false })

    if (accountError) {
        console.log("get accounts error ", accountError);
        redirect('/error');
    }

    const getSymbolsRequest = async () => {
        const { data, error } = await supabase.from("symbols").select().eq("isActive", true).order("createdAt", { ascending: false })

        if (error) {
            console.log("Can't load symbols data. Error: ", error)
            return [];
        }
        return data as Symbol[];
    }

    const getRulesRequest = async () => {
        const { data: rule, error } = await supabase.from("rules").select().eq("isActive", true).or(`isSystem.eq.true,userId.eq.${data.user.id}`)

        if (error) {
            console.log("Can't load rules data. Error: ", error)
            return [];
        }
        return rule as Rule[];
    }

    return (
        <AuthProvider user={data.user!}>
            <AccountProvider accounts={accounts as Account[]}>
                <ReferenceDataProvider getSymbolsRequest={getSymbolsRequest()} getRulesRequest={getRulesRequest()}>
                    {children}
                </ReferenceDataProvider>
            </AccountProvider>
        </AuthProvider>
    )
}

export default ProtectedLayout