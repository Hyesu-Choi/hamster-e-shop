"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { setShippingConfig } from "@/lib/shipping";

const schema = z.object({
  feeKrw: z.coerce.number().int().min(0).max(100000),
  freeThresholdKrw: z.coerce.number().int().min(0).max(10000000),
});

export type SettingsFormState = {
  saved?: boolean;
  error?: string;
};

export async function updateShippingSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    feeKrw: formData.get("feeKrw"),
    freeThresholdKrw: formData.get("freeThresholdKrw"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await setShippingConfig(parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { saved: true };
}
