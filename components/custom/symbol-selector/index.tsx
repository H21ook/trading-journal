"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useReferences } from "@/components/providers/reference-data-provider"
import { Symbol } from "@/lib/types/trade"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function SymbolSelector({
    placeholder = 'Select symbol...',
    searchPlaceholder = "Search symbol...",
    emptyText = "No symbols data."
}: {
    placeholder?: string,
    searchPlaceholder?: string
    emptyText?: string
}) {
    const { symbols } = useReferences();
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const groupedByCategory = symbols.reduce((acc: Record<string, Symbol[]>, order: Symbol) => {
        const { type } = order;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(order);
        return acc;
    }, {});

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    variant="secondary"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-9 bg-input hover:bg-input justify-between border"
                >
                    {value
                        ? symbols.find((item) => item.symbol === value)?.symbol
                        : placeholder}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full py-0 px-2">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <ScrollArea className="max-h-[264px]">
                            {
                                Object.keys(groupedByCategory).map(key => {
                                    const data = groupedByCategory[key];
                                    return (<CommandGroup key={key} heading={<span className="capitalize">{key}</span>} className="overflow-auto">
                                        {data.map((item) => (
                                            <CommandItem
                                                key={item.symbol}
                                                value={item.symbol}
                                                onSelect={(currentValue) => {
                                                    setValue(currentValue === value ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === item.symbol ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {item.symbol}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>)
                                })
                            }
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </CommandList>

                </Command>
            </PopoverContent>
        </Popover>
    )
}