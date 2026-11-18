export function generateProxyEmail(name: string, id: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const shortId = id.slice(-4);
  return `${cleanName}.${shortId}@relay.institution-alumni.edu`;
}

export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "Protected (In-Platform Voice/Chat Only)";
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "•••-•••-••••";
  const lastFour = clean.slice(-4);
  return `+1 ••• ••• ${lastFour}`;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "••••••@institution.edu";
  const visible = user.slice(0, 2);
  return `${visible}••••@${domain}`;
}
