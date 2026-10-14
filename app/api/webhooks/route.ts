import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { SupabaseUserType } from "@/features/auth/types";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/features/auth/services/user.service";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    if (eventType === "user.created") {
      const email = evt.data.email_addresses[0].email_address;

      if (!email) {
        return new Response("Email address not found", { status: 400 });
      }

      const supabaseUser: SupabaseUserType = {
        clerk_user_id: evt.data.id,
        name: evt.data.first_name,
        email,
        status: "active",
      };
      await createUser(supabaseUser);
    }

    if (eventType === "user.updated") {
      const email = evt.data.email_addresses[0].email_address;

      if (!email) {
        return new Response("Email address not found", { status: 400 });
      }

      const supabaseUser: SupabaseUserType = {
        clerk_user_id: evt.data.id,
        name: evt.data.first_name,
        email,
        status: evt.data.banned ? "banned" : "active",
      };
      await updateUser(supabaseUser);
    }

    if (eventType === "user.deleted") {
      const clerkUserId = evt.data.id;

      if (!clerkUserId) {
        return new Response("User ID not found", { status: 400 });
      }
      await deleteUser(clerkUserId);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
