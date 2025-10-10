"use client";

import { useReferences } from '@/components/providers/reference-data-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea'
import { createRule, toggleRuleActive } from '@/lib/actions/rule';
import { Rule } from '@/lib/types/trade'
import { LoaderCircle, Plus, Trash2 } from 'lucide-react'
import React, { useTransition } from 'react'
import { Controller, FieldValues, useForm } from 'react-hook-form';

const TradingRulesModal = ({
    open,
    onHide = () => { },
}: {
    open: boolean,
    onHide: () => void,
}) => {
    const { rules } = useReferences();
    const [isPending, startTransition] = useTransition();
    const [rulePending, startTransitionRule] = useTransition();
    const { control, handleSubmit } = useForm({
        defaultValues: {
            title: "",
            description: ""
        }
    })

    const handleToggleRuleActive = (ruleId: string) => {
        startTransitionRule(async () => {
            const res = await toggleRuleActive(ruleId);
            if (!res.isOk) {
                alert(res.error)
            }
        })
    }

    const handleCreateRule = (values: FieldValues) => {
        if (!values.title.trim()) return

        startTransition(async () => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values?.description);

            const res = await await createRule(formData)

            if (!res?.isOk) {
                alert(res.error)
            }
        })

    }
    return (
        <Dialog open={open} onOpenChange={(e) => {
            if (!e) {
                onHide()
            }
        }}>
            <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground flex items-center gap-2">
                        Manage Trading Rules
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create and manage your trading rules checklist for consistent discipline
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Add New Rule */}
                    <form className="space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                        <h4 className="font-medium text-card-foreground">Add New Rule</h4>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <div>
                                    <Label htmlFor="ruleTitle" className="text-card-foreground">
                                        Rule Title
                                    </Label>
                                    <Input
                                        id="ruleTitle"
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        placeholder="e.g., Always set SL/TP"
                                        className="bg-input border-border text-foreground"
                                    />
                                    {
                                        error ? <p className='text-sm text-destructive m-0'>{error?.message}</p> : null
                                    }
                                </div>
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field: { onChange, value } }) => (<div>
                                <Label htmlFor="ruleDescription" className="text-card-foreground">
                                    Description
                                </Label>
                                <Textarea
                                    id="ruleDescription"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    placeholder="Detailed description of the rule..."
                                    rows={2}
                                    className="bg-input border-border text-foreground"
                                />
                            </div>)}
                        />
                        <Button disabled={isPending} onClick={handleSubmit(handleCreateRule)} className="w-full bg-primary hover:bg-primary/90">
                            {isPending ? <LoaderCircle className='size-4 animate-spin' /> : <Plus className="w-4 h-4 mr-2" />}
                            {isPending ? "Loading" : "Add Rule"}
                        </Button>
                    </form>

                    {/* Existing Rules */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-card-foreground">Your Trading Rules</h4>
                        {rules.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No trading rules yet. Create your first rule above.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {rules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        className={`p-4 border rounded-lg ${rule.is_active ? "border-green-500/20 bg-green-500/5" : "border-border bg-muted/20"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-medium text-card-foreground">{rule.title}</h5>
                                                </div>
                                                {
                                                    rule?.description ? <p className="text-xs text-muted-foreground mt-2">
                                                        {rule.description}
                                                    </p> : null
                                                }

                                            </div>
                                            {
                                                rule.is_system ? <Badge>SYSTEM</Badge> :
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <Switch disabled={rulePending} className="cursor-pointer" checked={rule.is_active} onCheckedChange={() => handleToggleRuleActive(rule.id)} />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const updatedRules = rules.filter((r) => r.id !== rule.id)
                                                                // setRules(updatedRules)
                                                                localStorage.setItem("tradingRules", JSON.stringify(updatedRules))
                                                            }}
                                                            className="border-destructive text-destructive hover:bg-destructive/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>


                                                    </div>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button onClick={onHide} className="w-full bg-primary hover:bg-primary/90">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default TradingRulesModal