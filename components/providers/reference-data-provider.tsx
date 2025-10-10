"use client"
import { Rule, Symbol } from "@/lib/types/trade";
import { createContext, ReactNode, use, useContext } from "react";

const ReferenceDataContext = createContext<{
    symbols: Symbol[]
    rules: Rule[]
}>({
    symbols: [],
    rules: []
})

const ReferenceDataProvider = ({ children, getSymbolsRequest, getRulesRequest }: {
    children: ReactNode,
    getSymbolsRequest: Promise<Symbol[]>
    getRulesRequest: Promise<Rule[]>
}) => {
    const data = use(getSymbolsRequest);
    const rules = use(getRulesRequest);

    console.log("rules ", rules)

    return <ReferenceDataContext.Provider value={{
        symbols: data,
        rules,
    }}>
        {children}
    </ReferenceDataContext.Provider>
}
export default ReferenceDataProvider;

export const useReferences = () => {
    return useContext(ReferenceDataContext);
}