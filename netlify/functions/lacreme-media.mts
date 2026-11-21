import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  if (!["GET", "HEAD"].includes(req.method)) return new Response("Method not allowed", { status: 405 });
  const id = new URL(req.url).pathname.split("/").pop() || "";
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const item = await getStore({ name: "lacreme-media", consistency: "strong" }).getWithMetadata(id, { type: "arrayBuffer" });
  if (!item) return new Response("Not found", { status: 404 });
  const bytes = item.data;
  const headers = new Headers({ "Content-Type": String(item.metadata.contentType || "application/octet-stream"), "Content-Length": String(bytes.byteLength), "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=86400", "Accept-Ranges": "bytes" });
  const range = req.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const total = bytes.byteLength;
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    const start = match[1] ? Number(match[1]) : Math.max(0, total - Number(match[2]));
    const end = match[1] ? Math.min(match[2] ? Number(match[2]) : total - 1, total - 1) : total - 1;
    if (start >= total || end < start) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(req.method === "HEAD" ? null : bytes.slice(start, end + 1), { status: 206, headers });
  }
  return new Response(req.method === "HEAD" ? null : bytes, { headers });
};
export const config = { path: "/api/lacreme-media/:id" };
