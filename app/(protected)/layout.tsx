import AuthProvider from '@/components/providers/auth-provider'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'

const ProtectedLayout = async ({ children }: { children: ReactNode }) => {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/auth/login')
    }

    return (
        <AuthProvider user={data.user!}>{children}</AuthProvider>
    )
}

export default ProtectedLayout