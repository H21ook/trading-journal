"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { TradeStatus } from "../types/trade";

export const createNewTrade = async (formData: FormData) => {
  const parsedData = {
    accountId: formData.get("accountId"),
    symbolId: formData.get("symbolId"),
    actionType: formData.get("actionType"),
    action: formData.get("action"),
    riskToReward: formData.get("riskToReward"),
    emotion: formData.get("emotion"),
    note: formData.get("note"),
    status: TradeStatus.OPEN,
  };

  const rules = formData.getAll("rules[]");

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { isOk: false, error: "Unauthenticated" };

  const { data, error } = await supabase
    .from("trades")
    .insert({ ...parsedData, userId: user.id })
    .select()
    .single();

  if (error) {
    console.log(error);
    return { isOk: false, error: error.message };
  }

  const tradeRules = rules?.map((ruleId) => {
    return {
      ruleId,
      tradeId: data.id,
      userId: user.id,
    };
  });
  // console.log(tradeRules);
  const { error: tradeRuleError } = await supabase
    .from("trade_rules")
    .insert(tradeRules);

  if (tradeRuleError) {
    console.log(tradeRuleError);
    await supabase.from("trades").delete().eq("id", data.id);
    return { isOk: false, error: tradeRuleError.message };
  }

  revalidatePath("/", "layout");
  return { isOk: true };
};
