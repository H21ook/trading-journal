"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRule(formData: FormData) {
  const parsedData = {
    title: formData.get("title"),
    description: formData.get("description"),
    is_active: true,
    is_system: false,
  };

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { isOk: false, error: "Unauthenticated" };
  }

  const { data, error } = await supabase
    .from("rules")
    .insert({
      user_id: user.id,
      ...parsedData,
    })
    .select()
    .single();

  if (error) {
    console.error("Rule үүсгэх алдаа:", error);
    return {
      isOk: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");

  return {
    isOk: true,
    data,
  };
}

export async function toggleRuleActive(ruleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { isOk: false, error: "Unauthenticated" };
  }

  // Одоогийн rule-г авах
  const { data: currentRule, error: fetchError } = await supabase
    .from("rules")
    .select("is_active, user_id")
    .eq("id", ruleId).eq("is_system", false)
    .single();

  if (fetchError) {
    console.error("Rule олох алдаа:", fetchError);
    return { isOk: false, error: fetchError.message };
  }

  console.log("currentRule ",currentRule)
  const { data, error } = await supabase
    .from("rules")
    .update({ is_active: !currentRule.is_active })
    .eq("id", ruleId)
    .select().maybeSingle()

  if (error) {
    console.error("Rule шинэчлэх алдаа:", error);
    return {
      isOk: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout"); // Эсвэл таны rules хуудасны path

  return {
    isOk: true,
    data,
  };
}
