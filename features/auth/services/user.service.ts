import { createClient } from "@/lib/supabase/server";
import { SupabaseUserType } from "../types";

export async function createUser(user: SupabaseUserType) {
  const supabase = createClient();

  const { data: existingUser }: { data: SupabaseUserType | null } =
    await supabase.from("users").select().eq("email", user.email).single();

  if (existingUser != null && existingUser.status === "deleted") {
    const { data, error } = await updateUser({
      clerk_user_id: user.clerk_user_id,
      name: user.name,
      email: user.email,
      status: "active",
    });

    if (error) {
      throw error;
    }

    return data;
  }

  if (existingUser != null && existingUser.status !== "deleted") {
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUser(user: SupabaseUserType) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("email", user.email)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteUser(clerkUserId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .update({ status: "deleted" })
    .eq("clerk_user_id", clerkUserId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
