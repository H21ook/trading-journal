"use server";

import { createClient } from "@/utils/supabase/server";
import { Layout } from "lucide-react";
import { revalidatePath } from "next/cache";

export const createAccount = async (formData: FormData) => {
  const parsed = {
    name: formData.get("name"),
    type: formData.get("type"),
    initialDeposit: formData.get("initialDeposit"),
  };

  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { isOk: false, error: "Unauthenticated" };

  const payload = {
    userId: user.id,
    ...parsed,
    currentBalance: parsed.initialDeposit,
  };

  const { error } = await supabase.from("accounts").insert(payload);
  if (error) return { isOk: false, error: error.message };

  revalidatePath("/", "layout");
  return { isOk: true };
};
