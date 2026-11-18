import { parseLead } from "../../src/lib/lead.js";

// Public lead capture. Plain HTML form POST -> redirect, so it works without JS.
export async function onRequestPost({ request, env }) {
  const result = parseLead(await request.formData());
  if (result.spam) return Response.redirect(new URL("/thanks", request.url), 303); // don't tip off bots
  if (result.error) return new Response(result.error + " Go back and try again.", { status: 400 });
  const { name, email, phone, background, message } = result.lead;
  await env.DB.prepare("INSERT INTO leads (name, email, phone, background, message) VALUES (?, ?, ?, ?, ?)")
    .bind(name, email, phone, background, message).run();
  return Response.redirect(new URL("/thanks", request.url), 303);
}
