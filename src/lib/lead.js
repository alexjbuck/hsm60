export const BACKGROUNDS = ["Civilian pilot", "Active duty (any service)", "Separated / IRR", "Other reserve", "Other"];
export const STATUSES = ["new", "contacted", "in-process", "not-a-fit"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate a public form submission. Returns { lead } or { error }. */
export function parseLead(form) {
  const get = (k, max) => String(form.get(k) ?? "").trim().slice(0, max);
  if (get("website", 200)) return { spam: true }; // honeypot: humans never see this field
  const lead = {
    name: get("name", 120),
    email: get("email", 200).toLowerCase(),
    phone: get("phone", 40),
    background: get("background", 60),
    message: get("message", 2000),
  };
  if (!lead.name) return { error: "Name is required." };
  if (!EMAIL.test(lead.email)) return { error: "A valid email is required." };
  if (lead.phone && !/^[\d\s()+.-]{7,40}$/.test(lead.phone)) return { error: "Phone number looks wrong." };
  if (lead.background && !BACKGROUNDS.includes(lead.background)) return { error: "Pick a background from the list." };
  return { lead };
}
