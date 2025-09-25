"use client"
import { User } from '@supabase/supabase-js'
import React, { createContext, ReactNode, useContext } from 'react'
const AuthContext = createContext<{
    user?: User
}>({})

const AuthProvider = ({ user, children }: {
    children: ReactNode,
    user: User
}) => {
    return (
        <AuthContext.Provider value={{
            user
        }}>{children}</AuthContext.Provider>
    )
}

export default AuthProvider

export const useAuth = () => {
    return useContext(AuthContext);
}