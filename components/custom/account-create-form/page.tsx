"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAccount } from '@/lib/actions/account';
import { cn } from '@/lib/utils';
import React, { useTransition } from 'react'
import { Controller, FieldValues, useForm } from "react-hook-form"

const AccountCreateForm = () => {

    const [isPending, startTransition] = useTransition()
    const { control, handleSubmit } = useForm<{
        name: string,
        type: string,
        initial_deposit: string
    }>({
        defaultValues: {
            name: "",
            type: "forex",
            initial_deposit: ""
        }
    })

    const onSubmit = (newAccount: FieldValues) => {
        console.log("accountFormData ", newAccount)
        startTransition(async () => {
            const accountFormData = new FormData();
            accountFormData.append("name", newAccount.name);
            accountFormData.append("type", newAccount.type);
            accountFormData.append("initial_deposit", newAccount.initial_deposit);

            const res = await createAccount(accountFormData);

            if (!res.isOk) {
                alert(res.error)
            }
        })
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Card className="w-full max-w-md bg-card border-border">
                <CardHeader className="text-center">
                    <CardTitle className="text-card-foreground">Welcome to Trading Journal</CardTitle>
                    <p className="text-muted-foreground">Create your first trading account to get started</p>
                </CardHeader>
                <CardContent >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Controller
                            control={control}
                            name="name"
                            rules={{
                                required: "Please enter your account name.",
                                minLength: {
                                    value: 3,
                                    message: "Please 3 characters required"
                                },
                                validate: (val: string, formValues: FieldValues) => {
                                    if (!val?.trim()) {
                                        return "Please enter your account name."
                                    }
                                    return undefined
                                }
                            }}
                            render={({ field: { onChange, ...other }, fieldState: { error } }) => {
                                return (<div>
                                    <Label htmlFor="accountName" className="text-card-foreground">
                                        Account Name
                                    </Label>
                                    <Input
                                        id="accountName"
                                        onChange={(e) => onChange(e.target.value)}
                                        {...other}
                                        placeholder="e.g., Main Stocks, Crypto Portfolio"
                                        className="bg-input border-border text-foreground"
                                    />
                                    {
                                        error && <span className='text-sm text-red-500'>{error?.message}</span>
                                    }
                                </div>)
                            }}
                        />
                        <Controller
                            control={control}
                            name="type"
                            rules={{
                                required: "Please select account type."
                            }}
                            render={({ field: { value, onChange }, fieldState: { error } }) => {
                                return (<div>
                                    <Label htmlFor="accountType" className="text-card-foreground">
                                        Account Type
                                    </Label>
                                    <Select
                                        value={value}
                                        onValueChange={(value: "forex" | "stocks" | "crypto") => onChange(value)}
                                    >
                                        <SelectTrigger className={cn("bg-input border-border text-foreground", error && "border-red-500")}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            <SelectItem value="stocks" className="text-popover-foreground">
                                                Stocks
                                            </SelectItem>
                                            <SelectItem value="forex" className="text-popover-foreground">
                                                Forex
                                            </SelectItem>
                                            <SelectItem value="crypto" className="text-popover-foreground">
                                                Crypto
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {
                                        error && <span className='text-sm text-red-500'>{error?.message}</span>
                                    }
                                </div>)
                            }}
                        />
                        <Controller
                            control={control}
                            name="initial_deposit"
                            rules={{
                                required: "Please enter deposit amount.",
                                validate: (val: string, formValues: FieldValues) => {
                                    if (!val) {
                                        return "Please enter deposit amount."
                                    }
                                    const numberValue = Number(val)
                                    if (isNaN(numberValue)) {
                                        return "Please enter numberic value.";
                                    }
                                    if (numberValue < 0) {
                                        return "Please enter positive numeric value."
                                    }
                                    return undefined
                                }
                            }}
                            render={({ field: { onChange, ...other }, fieldState: { error } }) => {
                                return (<div>
                                    <Label htmlFor="initialDeposit" className="text-card-foreground">
                                        Initial Deposit
                                    </Label>
                                    <Input
                                        id="initialDeposit"
                                        type="number"
                                        step="1"
                                        onKeyDown={(e) => {
                                            if (["KeyE", "Minus"].includes(e.code)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        onChange={(e) => {
                                            onChange(e.target.value)
                                        }}
                                        placeholder="10000"
                                        className="bg-input border-border text-foreground"
                                        {...other}
                                    />
                                    {
                                        error && <span className='text-sm text-red-500'>{error?.message}</span>
                                    }
                                </div>)
                            }}
                        />
                        <Button disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
                            {isPending ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}

export default AccountCreateForm