import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name ?? null,
      imageUrl: authUser.user_metadata?.avatar_url ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [fallback] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  return fallback ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) throw new Error("Forbidden");
  return user;
}
