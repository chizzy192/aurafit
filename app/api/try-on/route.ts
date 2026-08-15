// src/app/api/try-on/route.ts
import { runVirtualTryOn, type BodyPartCategory } from "@/lib/youcam/vto";
import { getServerSupabase } from "@/lib/supabase.server";

async function fetchImageBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch image at ${url} (${res.status})`);
  return res.arrayBuffer();
}

export async function POST(req: Request) {
  try {
    const { bodyPart, category, userImageUrl, garmentImageUrl } = (await req.json()) as {
      bodyPart?: BodyPartCategory;
      category?: BodyPartCategory;
      userImageUrl: string;
      garmentImageUrl: string;
    };
    const resolvedBodyPart = bodyPart ?? category;

    if (!resolvedBodyPart || !userImageUrl || !garmentImageUrl) {
      return Response.json({ error: "bodyPart, userImageUrl, and garmentImageUrl are required" }, { status: 400 });
    }

    const [userImage, garmentImage] = await Promise.all([
      fetchImageBytes(userImageUrl),
      fetchImageBytes(garmentImageUrl),
    ]);

    const result = await runVirtualTryOn({
      category: resolvedBodyPart,
      userImage,
      garmentImage,
    });

    // Best-effort save to the lookbook — don't fail the request if this
    // errors (e.g. user not authenticated in a demo context).
    try {
      const supabase = await getServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("lookbook_items").insert({
          user_id: user.id,
          body_part: resolvedBodyPart,
          result_image_url: result.resultUrl,
        });
      }
    } catch {
      // non-fatal — the try-on result still returns to the client
    }

    return Response.json({ resultUrl: result.resultUrl, resultImageUrl: result.resultUrl, taskId: result.taskId });
  } catch (err: unknown) {
    console.error("try-on route error:", err);
    const message = err instanceof Error ? err.message : "Virtual try-on failed. Please try again.";
    return Response.json(
      { error: message },
      { status: 502 }
    );
  }
}