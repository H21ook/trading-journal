"use client";

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TradingRule } from '@/lib/types/trade'
import { CheckSquare, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

const TradingRulesModal = ({
    open,
    onHide = () => { },
    rules: initialRules = []
}: {
    open: boolean,
    onHide: () => void,
    rules: TradingRule[]
}) => {
    const [rules, setRules] = useState<TradingRule[]>(initialRules)
    const [newRule, setNewRule] = useState({
        title: "",
        description: "",
    })
    const toggleRuleActive = (ruleId: string) => {
        const updatedRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule))
        setRules(updatedRules)
        localStorage.setItem("tradingRules", JSON.stringify(updatedRules))
    }

    const handleCreateRule = () => {
        if (!newRule.title.trim() || !newRule.description.trim()) return

        const rule: TradingRule = {
            id: Date.now().toString(),
            title: newRule.title,
            description: newRule.description,
            isActive: true,
            createdAt: new Date().toISOString().split("T")[0],
        }

        const updatedRules = [...rules, rule]
        setRules(updatedRules)
        localStorage.setItem("tradingRules", JSON.stringify(updatedRules))

        setNewRule({
            title: "",
            description: "",
        })
        onHide()
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
                        <CheckSquare className="w-5 h-5" />
                        Manage Trading Rules
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create and manage your trading rules checklist for consistent discipline
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Add New Rule */}
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                        <h4 className="font-medium text-card-foreground">Add New Rule</h4>
                        <div>
                            <Label htmlFor="ruleTitle" className="text-card-foreground">
                                Rule Title
                            </Label>
                            <Input
                                id="ruleTitle"
                                value={newRule.title}
                                onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                                placeholder="e.g., Always set SL/TP"
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="ruleDescription" className="text-card-foreground">
                                Description
                            </Label>
                            <Textarea
                                id="ruleDescription"
                                value={newRule.description}
                                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                placeholder="Detailed description of the rule..."
                                rows={2}
                                className="bg-input border-border text-foreground"
                            />
                        </div>
                        <Button onClick={handleCreateRule} className="w-full bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Rule
                        </Button>
                    </div>

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
                                        className={`p-4 border rounded-lg ${rule.isActive ? "border-green-500/30 bg-green-500/10" : "border-border bg-muted/20"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h5 className="font-medium text-card-foreground">{rule.title}</h5>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${rule.isActive
                                                            ? "border-green-500/30 text-green-400"
                                                            : "border-border text-muted-foreground"
                                                            }`}
                                                    >
                                                        {rule.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{rule.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Created: {new Date(rule.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleRuleActive(rule.id)}
                                                    className={`border-border text-foreground hover:bg-muted ${rule.isActive ? "bg-green-500/20" : ""
                                                        }`}
                                                >
                                                    {rule.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const updatedRules = rules.filter((r) => r.id !== rule.id)
                                                        setRules(updatedRules)
                                                        localStorage.setItem("tradingRules", JSON.stringify(updatedRules))
                                                    }}
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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
        </Dialog>
    )
}

export default TradingRulesModal