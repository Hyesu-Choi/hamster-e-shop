"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { productImages, products } from "@/lib/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";

const PRODUCT_BUCKET = "products";

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "파일이 없습니다" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "파일 크기는 5MB 이하여야 합니다" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "이미지 파일만 업로드 가능합니다" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

const productSchema = z.object({
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요")
    .regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈만 가능"),
  name: z.string().min(1, "상품명을 입력하세요").max(200),
  description: z.string().max(2000).optional(),
  priceKrw: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().optional(),
  categoryId: z.uuid().nullable().optional(),
  isPublished: z.coerce.boolean().default(true),
});

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type ParseResult =
  | { ok: true; data: z.infer<typeof productSchema> }
  | { ok: false; state: ProductFormState };

function parseForm(formData: FormData): ParseResult {
  const raw = {
    slug: formData.get("slug")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() || undefined,
    priceKrw: formData.get("priceKrw"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl")?.toString() || undefined,
    categoryId: formData.get("categoryId")?.toString() || null,
    isPublished: formData.get("isPublished") === "on",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, state: { fieldErrors } };
  }
  return { ok: true, data: parsed.data };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const result = parseForm(formData);
  if (!result.ok) return result.state;
  const data = result.data;

  try {
    await db.insert(products).values({
      slug: data.slug,
      name: data.name,
      priceKrw: data.priceKrw,
      stock: data.stock,
      isPublished: data.isPublished,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
      description: data.description || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "저장 실패";
    if (message.includes("duplicate")) {
      return { error: "이미 사용 중인 슬러그입니다" };
    }
    return { error: message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const result = parseForm(formData);
  if (!result.ok) return result.state;
  const data = result.data;

  try {
    await db
      .update(products)
      .set({
        slug: data.slug,
        name: data.name,
        priceKrw: data.priceKrw,
        stock: data.stock,
        isPublished: data.isPublished,
        categoryId: data.categoryId || null,
        imageUrl: data.imageUrl || null,
        description: data.description || null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "저장 실패";
    return { error: message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;

  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

const addImageSchema = z.object({
  productId: z.uuid(),
  url: z.url(),
  alt: z.string().max(200).optional(),
});

export async function addProductImage(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = addImageSchema.safeParse({
    productId: formData.get("productId"),
    url: formData.get("url"),
    alt: formData.get("alt")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db
    .select({ position: productImages.position })
    .from(productImages)
    .where(eq(productImages.productId, parsed.data.productId));
  const nextPosition =
    existing.length === 0
      ? 0
      : Math.max(...existing.map((e) => e.position)) + 1;

  await db.insert(productImages).values({
    productId: parsed.data.productId,
    url: parsed.data.url,
    alt: parsed.data.alt ?? null,
    position: nextPosition,
  });

  revalidatePath(`/admin/products/${parsed.data.productId}/edit`);
  revalidatePath("/products", "layout");
  return {};
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const productId = formData.get("productId")?.toString();
  if (!id) return;

  await db.delete(productImages).where(eq(productImages.id, id));
  if (productId) {
    revalidatePath(`/admin/products/${productId}/edit`);
  }
  revalidatePath("/products", "layout");
}
