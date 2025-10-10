"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { TradeStatus } from "../types/trade";

export const createNewTrade = async (formData: FormData) => {
  const parsedData = {
    account_id: formData.get("account_id"),
    symbol_id: formData.get("symbol_id"),
    action_type: formData.get("action_type"),
    action: formData.get("action"),
    risk_to_reward: formData.get("risk_to_reward"),
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
    .insert({ ...parsedData, user_id: user.id, rule_ids: rules })
    .select()
    .single();

  if (error) {
    console.log(error);
    return { isOk: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { isOk: true, data };
};
