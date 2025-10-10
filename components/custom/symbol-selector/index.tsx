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
import { Badge } from "@/components/ui/badge"

export function SymbolSelector({
    placeholder = 'Select symbol...',
    searchPlaceholder = "Search symbol...",
    emptyText = "No symbols data.",
    value,
    onChange
}: {
    placeholder?: string,
    searchPlaceholder?: string
    emptyText?: string,
    value?: number,
    onChange?: (val: number) => void
}) {
    const { symbols } = useReferences();
    const [open, setOpen] = React.useState(false)

    const groupedByCategory = symbols.reduce((acc: Record<string, Symbol[]>, order: Symbol) => {
        const { type } = order;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(order);
        return acc;
    }, {});

    const renderSelectedValue = (value: number) => {
        const selected = symbols.find((item) => item.id === value);
        return <div className="flex items-center gap-2">
            <div>{selected?.symbol}</div>
            <Badge variant={"secondary"} className="rounded-sm uppercase text-xs">{selected?.type}</Badge>
        </div>
    }

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
                        ? renderSelectedValue(value)
                        : placeholder}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button >
            </PopoverTrigger>
            <PopoverContent className="w-max-content p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <ScrollArea className="max-h-[264px]">
                            {
                                Object.keys(groupedByCategory).map(key => {
                                    const data = groupedByCategory[key];
                                    return (<CommandGroup key={key} heading={<span className="capitalize">{key}</span>} className="overflow-auto">
                                        {data.map((item) => {
                                            return (
                                                <CommandItem
                                                    key={item.symbol}
                                                    value={item.id.toString()}
                                                    onSelect={() => {
                                                        onChange?.(item.id)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            value === item.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {item.symbol}
                                                </CommandItem>
                                            )
                                        })}
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