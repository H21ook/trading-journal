"use client"
import { Symbol } from "@/lib/types/trade";
import { createContext, ReactNode, use, useContext } from "react";

const ReferenceDataContext = createContext<{
    symbols: Symbol[]
}>({
    symbols: []
})

const ReferenceDataProvider = ({ children, getSymbolsRequest }: {
    children: ReactNode,
    getSymbolsRequest: Promise<Symbol[]>
}) => {
    const data = use(getSymbolsRequest);

    return <ReferenceDataContext.Provider value={{
        symbols: data
    }}>
        {children}
    </ReferenceDataContext.Provider>
}
export default ReferenceDataProvider;

export const useReferences = () => {
    return useContext(ReferenceDataContext);
}