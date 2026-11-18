import { STATUSES } from "../../../src/lib/lead.js";

const RETENTION = "-36 months"; // outlasts a 24-month sea tour; matches the 36-month promise in the form's privacy statement
const json = (body) => Response.json(body, { headers: { "cache-control": "no-store" } }); // PII: never cache

export async function onRequestGet({ env }) {
  // shortcut: retention purge runs when the admin page loads, not on a schedule; move to a Worker cron if the page goes unused for months.
  await env.DB.prepare("DELETE FROM leads WHERE created_at < datetime('now', ?)").bind(RETENTION).run();
  const { results } = await env.DB.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
  return json(results);
}

// { id, status, notes } updates a lead; { id, delete: true } removes it.
export async function onRequestPost({ request, env }) {
  // Requiring JSON forces a CORS preflight, so other sites can't forge this with a plain form.
  if (request.headers.get("content-type") !== "application/json") return new Response("Unsupported", { status: 415 });
  const body = await request.json();
  if (!Number.isInteger(body.id)) return new Response("Bad request", { status: 400 });
  if (body.delete === true) {
    await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(body.id).run();
    return new Response(null, { status: 204 });
  }
  if (!STATUSES.includes(body.status)) return new Response("Bad request", { status: 400 });
  await env.DB.prepare("UPDATE leads SET status = ?, notes = ? WHERE id = ?")
    .bind(body.status, String(body.notes ?? "").slice(0, 4000), body.id).run();
  return new Response(null, { status: 204 });
}
