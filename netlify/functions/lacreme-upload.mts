import { getStore } from "@netlify/blobs";

const MAX_BYTES = 4 * 1024 * 1024;
export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const origin = req.headers.get("origin");
  if (!origin || !["https://lacreme.app", "https://www.lacreme.app", "https://lacreme-app.netlify.app", "https://calculadora-network.netlify.app"].includes(origin)) {
    return Response.json({ error: "Upload from the LaCreme check-in form." }, { status: 403 });
  }
  if (Number(req.headers.get("content-length")) > MAX_BYTES + 65536) return Response.json({ error: "Maximum upload size is 4 MB." }, { status: 413 });
  const data = await req.formData().catch(() => null);
  const file = data?.get("file");
  if (!(file instanceof File) || !file.size || file.size > MAX_BYTES) return Response.json({ error: "Choose a photo or video up to 4 MB." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = (start: number, end: number) => new TextDecoder().decode(bytes.slice(start, end));
  const valid = (file.type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    || (file.type === "image/png" && bytes[0] === 137 && ascii(1, 4) === "PNG" && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10)
    || (file.type === "video/mp4" && bytes.length >= 12 && ascii(4, 8) === "ftyp")
    || (file.type === "video/webm" && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3);
  if (!valid) return Response.json({ error: "Use a valid JPEG, PNG, MP4 or WebM file." }, { status: 400 });
  const id = crypto.randomUUID();
  await getStore({ name: "lacreme-media", consistency: "strong" }).set(id, bytes.buffer, { metadata: { contentType: file.type } });
  return Response.json({ url: `/api/lacreme-media/${id}`, type: file.type }, { status: 201 });
};
export const config = { path: "/api/lacreme-upload", rateLimit: { action: "rate_limit", aggregateBy: "ip", windowSize: 60, windowLimit: 6 } };
