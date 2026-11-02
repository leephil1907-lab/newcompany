type EmailInput = { to: string; subject: string; html: string; text: string };
const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char] ?? char));
export function emailLayout(title: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#f7f8f5;font-family:Arial,sans-serif;color:#18251b"><div style="max-width:620px;margin:32px auto;padding:0 16px"><div style="background:#153b1d;border-radius:20px 20px 0 0;padding:28px 32px;color:#fff"><div style="font-size:21px;font-weight:700">AgroBridge <span style="color:#b8df8e">Consult</span></div><div style="font-size:11px;letter-spacing:2px;margin-top:5px;color:#d8e8d3">CONNECTING FARMERS TO SMARTER GROWTH</div></div><main style="background:#fff;padding:32px;border:1px solid #e5eae2"><h1 style="font-size:24px;line-height:1.3;margin:0 0 20px">${esc(title)}</h1>${body}</main><footer style="padding:22px;text-align:center;color:#68756a;font-size:12px">AgroBridge Consult · Lagos, Nigeria<br><a style="color:#1b5e20" href="https://agrobridgeconsult.com">agrobridgeconsult.com</a></footer></div></body></html>`;
}
export async function sendEmail(input: EmailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  const response = await fetch("https://api.resend.com/emails", { method:"POST", headers:{ Authorization:`Bearer ${key}`, "Content-Type":"application/json" }, body:JSON.stringify({ from, to:[input.to], subject:input.subject, html:input.html, text:input.text }), cache:"no-store", signal:AbortSignal.timeout(15000) });
  if (!response.ok) {
    const message = await response.text();
    console.error("Email provider error:", response.status, message.slice(0,500));
    return false;
  }
  return true;
}
export function paragraph(value: string) { return `<p style="font-size:15px;line-height:1.8;color:#435347">${esc(value)}</p>`; }
export function safeText(value: string) { return esc(value); }
