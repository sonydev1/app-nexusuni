"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const MAX_SIZE = 512 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

type Result = { error?: string };

// Devuelve el id del usuario objetivo si quien llama tiene permiso
async function resolveTarget(requestedId: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" as const };

  const targetId = requestedId || user.id;
  if (targetId !== user.id) {
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _role: "admin",
    });
    if (!isAdmin) return { error: "No autorizado" as const };
  }
  return { targetId };
}

function detectImageType(
  b: Uint8Array,
): "image/png" | "image/jpeg" | "image/webp" | null {
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
  ) {
    return "image/png";
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return "image/jpeg";
  }
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...b.slice(from, to));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

export async function updateAvatar(formData: FormData): Promise<Result> {
  const target = await resolveTarget(formData.get("userId") as string | null);
  if ("error" in target) return { error: target.error };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Archivo inválido" };

  if (file.size > MAX_SIZE) return { error: "La imagen es demasiado grande" };

  // Se confía en el contenido real del archivo, no en el tipo que declara el cliente
  const buffer = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type) return { error: "Formato no permitido (usa JPG, PNG o WebP)" };

  const admin = createAdminClient();
  const path = `${target.targetId}/${crypto.randomUUID()}.${EXTENSIONS[type]}`;
  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(path, buffer, { contentType: type, cacheControl: "31536000" });
  if (uploadError) return { error: "No se pudo subir la imagen" };

  const { data: old } = await admin
    .from("profiles")
    .select("avatar_path")
    .eq("id", target.targetId)
    .single();

  const { error: dbError } = await admin
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", target.targetId);

  if (dbError) {
    await admin.storage.from("avatars").remove([path]); // no dejar archivos huérfanos
    return { error: "No se pudo guardar el avatar" };
  }

  if (old?.avatar_path)
    await admin.storage.from("avatars").remove([old.avatar_path]);

  revalidatePath("/", "layout");
  return {};
}

export async function removeAvatar(userId?: string): Promise<Result> {
  const target = await resolveTarget(userId ?? null);
  if ("error" in target) return { error: target.error };

  const admin = createAdminClient();
  const { data: old } = await admin
    .from("profiles")
    .select("avatar_path")
    .eq("id", target.targetId)
    .single();

  await admin
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", target.targetId);
  if (old?.avatar_path)
    await admin.storage.from("avatars").remove([old.avatar_path]);

  revalidatePath("/", "layout");
  return {};
}
