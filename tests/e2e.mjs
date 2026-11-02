// End-to-end smoke tests for AgroBridge Consult.
//
// Exercises public forms, the client workspace, staff/admin actions, access rules, content publishing,
// password reset and the cron endpoints against a running app and its PostgreSQL database, then removes
// every record it created.
//
// Usage (app must be running, e.g. `npm run build && npm start`):
//   BASE_URL=http://localhost:3000 DATABASE_URL=... CRON_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:e2e
//
// Safety: the suite writes to the database, so it refuses to run against a non-local database unless
// E2E_ALLOW_REMOTE_DB=1 is set. Never point it at production.
import { createHash, randomBytes } from "node:crypto";
import postgres from "postgres";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const { DATABASE_URL, CRON_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const missing = Object.entries({ DATABASE_URL, CRON_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD }).filter(([, value]) => !value).map(([key]) => key);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(2);
}
const dbHost = new URL(DATABASE_URL).hostname;
if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(dbHost) && process.env.E2E_ALLOW_REMOTE_DB !== "1") {
  console.error(`Refusing to run against non-local database host "${dbHost}". Set E2E_ALLOW_REMOTE_DB=1 to override (never on production).`);
  process.exit(2);
}

const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });
const RUN = Date.now().toString(36);
const email = (who) => `e2e.${who}.${RUN}@example.com`;
const slug = (kind) => `e2e-${kind}-${RUN}`;
const daysFromNow = (days) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const NOT_FOUND_TEXT = "taken root"; // from app/not-found.tsx
const JPEG_1PX = Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=", "base64");
const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

let requestCount = 0, passed = 0;
const failures = [];
function check(name, ok, detail = "") {
  if (ok) passed++; else failures.push(name);
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${detail && !ok ? `  (${detail})` : ""}`);
}
const section = (title) => console.log(`\n${title}`);
const brief = (data) => (typeof data === "string" ? data : JSON.stringify(data)).slice(0, 160);

// Each request uses a distinct client address so the per-IP rate limits don't interfere with the suite.
async function call(method, path, { json, form, cookie, headers = {} } = {}) {
  requestCount++;
  const allHeaders = { "x-forwarded-for": `10.99.${Math.floor(requestCount / 250) % 250}.${requestCount % 250}`, ...headers };
  let body;
  if (json !== undefined) { allHeaders["content-type"] = "application/json"; body = JSON.stringify(json); }
  if (form) body = form;
  if (cookie) allHeaders.cookie = cookie;
  const response = await fetch(BASE_URL + path, { method, headers: allHeaders, body, redirect: "manual" });
  const text = await response.text();
  let data = text;
  try { data = JSON.parse(text); } catch { /* not JSON */ }
  const session = (response.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).find((c) => c.startsWith("agrobridge_session="));
  return { status: response.status, data, text, session, type: response.headers.get("content-type") ?? "" };
}
const page = async (path, cookie) => (await call("GET", path, { cookie })).text;
function cropForm(fields, photo) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  if (photo) form.set("photo", new Blob([photo.bytes], { type: photo.type }), photo.name);
  return form;
}
const cropFields = { name: "E2E Farmer A", email: email("a"), location: "Oyo State", crop: "Tomato", symptoms: "Yellowing leaves with brown spots spreading upward." };

try {
  section("Public pages");
  for (const path of ["/", "/about", "/services", "/book-consultation", "/farm-planner", "/crop-health", "/academy", "/programmes", "/projects", "/insights", "/pricing", "/faq", "/contact", "/login", "/register", "/forgot-password", "/privacy", "/terms", "/robots.txt", "/sitemap.xml", "/api/health"]) {
    const { status } = await call("GET", path);
    check(`GET ${path} → 200`, status === 200, status);
  }
  check("unknown page shows the branded 404", (await page("/this-page-does-not-exist")).includes(NOT_FOUND_TEXT));

  section("Accounts and sessions");
  const admin = await call("POST", "/api/auth/login", { json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check("admin signs in", admin.status === 200 && Boolean(admin.session), admin.status);
  const clientA = await call("POST", "/api/auth/register", { json: { name: "E2E Farmer A", email: email("a"), password: "E2ePassword#A1" } });
  const clientB = await call("POST", "/api/auth/register", { json: { name: "E2E Farmer B", email: email("b"), password: "E2ePassword#B1" } });
  check("client A registers", clientA.status === 201 && Boolean(clientA.session), clientA.status);
  check("client B registers", clientB.status === 201 && Boolean(clientB.session), clientB.status);
  check("duplicate email is rejected", (await call("POST", "/api/auth/register", { json: { name: "Duplicate", email: email("a"), password: "E2ePassword#A1" } })).status === 409);
  check("wrong password is rejected", (await call("POST", "/api/auth/login", { json: { email: email("a"), password: "not-the-password" } })).status === 401);
  const [adminCookie, aCookie, bCookie] = [admin.session, clientA.session, clientB.session];
  const bId = clientB.data.user?.id, aId = clientA.data.user?.id;
  const anonSession = await call("GET", "/api/auth/session");
  check("session probe: signed out → 200 with no user", anonSession.status === 200 && anonSession.data.user === null, brief(anonSession.data));
  check("session probe: staff → admin role", (await call("GET", "/api/auth/session", { cookie: adminCookie })).data.user?.role === "admin");
  check("session probe: client → client role", (await call("GET", "/api/auth/session", { cookie: aCookie })).data.user?.role === "client");

  section("Public forms");
  const appointment = await call("POST", "/api/appointments", { cookie: aCookie, json: { name: "E2E Farmer A", email: email("a"), preferredDate: daysFromNow(1), preferredTime: "10:00", meetingType: "online", notes: "E2E appointment" } });
  check("appointment request is saved", appointment.status === 201, brief(appointment.data));
  check("appointment with an invalid time is rejected", (await call("POST", "/api/appointments", { json: { name: "E2E Person", email: email("x"), preferredDate: daysFromNow(1), preferredTime: "23:00", meetingType: "online" } })).status === 400);
  const plan = await call("POST", "/api/farm-plans", { cookie: aCookie, json: { clientName: "E2E Farmer A", email: email("a"), location: "Ogun State", landSize: "5 hectares", enterpriseType: "crop", cropsOrAnimals: "Maize and cassava" } });
  check("farm plan brief is saved", plan.status === 201, brief(plan.data));
  const enquiry = await call("POST", "/api/inquiries", { cookie: aCookie, json: { name: "E2E Farmer A", email: email("a"), message: "E2E enquiry about poultry farm setup." } });
  check("consultation enquiry is saved", enquiry.status === 201, brief(enquiry.data));
  check("newsletter sign-up is accepted", (await call("POST", "/api/newsletter", { json: { email: email("news"), consent: true } })).status === 201);
  check("newsletter sign-up without consent is rejected", (await call("POST", "/api/newsletter", { json: { email: email("news2"), consent: false } })).status === 400);
  const assistant = await call("POST", "/api/assistant", { json: { messages: [{ role: "user", content: "How do I start a maize farm?" }] } });
  check("farm assistant replies", assistant.status === 200 && typeof assistant.data.reply === "string" && assistant.data.reply.length > 20, brief(assistant.data));

  section("Crop-health photos");
  const cropCase = await call("POST", "/api/crop-cases", { cookie: aCookie, form: cropForm(cropFields, { bytes: JPEG_1PX, type: "image/jpeg", name: "leaf.jpg" }) });
  check("crop case with a JPEG photo is saved", cropCase.status === 201, brief(cropCase.data));
  const pngCase = await call("POST", "/api/crop-cases", { form: cropForm(cropFields, { bytes: PNG_1PX, type: "image/png", name: "leaf.png" }) });
  check("crop case with a PNG photo is saved", pngCase.status === 201, brief(pngCase.data));
  const disguised = await call("POST", "/api/crop-cases", { form: cropForm(cropFields, { bytes: Buffer.from("<html>not an image</html>"), type: "image/jpeg", name: "fake.jpg" }) });
  check("non-image disguised as JPEG is rejected", disguised.status === 400, `${disguised.status} ${brief(disguised.data)}`);
  const oversized = Buffer.alloc(4 * 1024 * 1024 + 1, 0); JPEG_1PX.copy(oversized);
  check("photo over 4 MB is rejected", (await call("POST", "/api/crop-cases", { form: cropForm(cropFields, { bytes: oversized, type: "image/jpeg", name: "huge.jpg" }) })).status === 400);
  const cropId = cropCase.data.id;
  const staffImage = await call("GET", `/api/crop-cases/${cropId}/image`, { cookie: adminCookie });
  check("staff can view the photo", staffImage.status === 200 && staffImage.type.startsWith("image/jpeg"), `${staffImage.status} ${staffImage.type}`);
  check("PNG is stored with its detected type", (await call("GET", `/api/crop-cases/${pngCase.data.id}/image`, { cookie: adminCookie })).type.startsWith("image/png"));
  check("owner can view their photo", (await call("GET", `/api/crop-cases/${cropId}/image`, { cookie: aCookie })).status === 200);
  check("another client cannot view it", (await call("GET", `/api/crop-cases/${cropId}/image`, { cookie: bCookie })).status === 404);
  check("anonymous visitors cannot view it", (await call("GET", `/api/crop-cases/${cropId}/image`)).status === 401);

  section("Client workspace");
  const workspace = await call("GET", "/api/workspace", { cookie: aCookie });
  check("workspace lists the client's own records", workspace.status === 200 && workspace.text.includes("Tomato") && workspace.text.includes("Ogun State"), workspace.status);
  check("workspace page renders", (await call("GET", "/workspace", { cookie: aCookie })).status === 200);
  check("another client's workspace excludes those records", !(await call("GET", "/api/workspace", { cookie: bCookie })).text.includes("Ogun State"));

  section("Staff pipeline");
  check("enquiry moves to reviewing", (await call("PATCH", "/api/admin/inquiries", { cookie: adminCookie, json: { id: enquiry.data.id, status: "reviewing" } })).status === 200);
  check("appointment is confirmed", (await call("PATCH", "/api/admin/appointments", { cookie: adminCookie, json: { id: appointment.data.id, status: "confirmed" } })).status === 200);
  check("crop case gets expert notes", (await call("PATCH", "/api/admin/crop-cases", { cookie: adminCookie, json: { id: cropId, status: "expert_response_sent", expertNotes: "Likely early blight; confirm on a field visit." } })).status === 200);
  check("farm plan moves to reviewing", (await call("PATCH", `/api/admin/farm-plans/${plan.data.id}`, { cookie: adminCookie, json: { status: "reviewing" } })).status === 200);
  check("clients cannot use staff APIs (403)", (await call("PATCH", "/api/admin/inquiries", { cookie: aCookie, json: { id: enquiry.data.id, status: "closed" } })).status === 403);
  check("anonymous visitors cannot use staff APIs", [401, 403].includes((await call("GET", "/api/admin/inquiries")).status));

  section("Roles (checked against the database on every request)");
  check("admin promotes B to consultant", (await call("PATCH", "/api/admin/users", { cookie: adminCookie, json: { userId: bId, role: "consultant" } })).status === 200);
  check("B gains staff access immediately", (await call("GET", "/api/admin/overview", { cookie: bCookie })).status === 200);
  check("B is demoted back to client", (await call("PATCH", "/api/admin/users", { cookie: adminCookie, json: { userId: bId, role: "client" } })).status === 200);
  check("B loses staff access immediately", (await call("GET", "/api/admin/overview", { cookie: bCookie })).status === 403);
  const adminId = (await call("GET", "/api/auth/me", { cookie: adminCookie })).data.user?.id;
  check("admin cannot remove their own admin role", (await call("PATCH", "/api/admin/users", { cookie: adminCookie, json: { userId: adminId, role: "client" } })).status === 400);

  section("Content publishing");
  const article = await call("POST", "/api/admin/articles", { cookie: adminCookie, json: { title: `E2E article ${RUN}`, slug: slug("article"), excerpt: "An end-to-end test article excerpt.", body: "This is the body of an end-to-end test article used to verify publishing.", published: true } });
  check("article is published", article.status === 201, brief(article.data));
  check("article appears on /insights", (await page("/insights")).includes(`E2E article ${RUN}`));
  check("article page renders", (await page(`/insights/${slug("article")}`)).includes(`E2E article ${RUN}`));
  check("article is unpublished", (await call("PATCH", `/api/admin/articles/${article.data.item?.id}`, { cookie: adminCookie, json: { published: false } })).status === 200);
  check("unpublished article is no longer public", (await page(`/insights/${slug("article")}`)).includes(NOT_FOUND_TEXT));
  const project = await call("POST", "/api/admin/projects", { cookie: adminCookie, json: { title: `E2E project ${RUN}`, slug: slug("project"), summary: "An end-to-end test project summary.", published: true } });
  check("project is published", project.status === 201, brief(project.data));
  check("project page renders", (await page(`/projects/${slug("project")}`)).includes(`E2E project ${RUN}`));
  const course = await call("POST", "/api/training/courses", { cookie: adminCookie, json: { title: `E2E course ${RUN}`, slug: slug("course"), summary: "An end-to-end test course summary.", published: false } });
  check("draft course is created", course.status === 201, brief(course.data));
  const courseId = course.data.item?.id;
  check("lesson is added", (await call("POST", "/api/admin/lessons", { cookie: adminCookie, json: { courseId, title: "E2E lesson one", content: "Lesson content that is long enough to pass the lesson validation rules.", position: 1 } })).status === 201);
  check("draft course is hidden from the public", (await page(`/academy/${slug("course")}`)).includes(NOT_FOUND_TEXT));
  check("course is published", (await call("PATCH", `/api/admin/courses/${courseId}`, { cookie: adminCookie, json: { published: true } })).status === 200);
  check("published course page renders", (await page(`/academy/${slug("course")}`)).includes(`E2E course ${RUN}`));
  check("client can enrol in the course", [200, 201].includes((await call("POST", "/api/training/enroll", { cookie: aCookie, json: { courseId } })).status));

  section("Training programmes");
  const programme = await call("POST", "/api/admin/programmes", { cookie: adminCookie, json: { title: `E2E programme ${RUN}`, slug: slug("programme"), summary: "An end-to-end test programme summary.", description: "Full description of the end-to-end test training programme.", deliveryMode: "in_person", startDate: daysFromNow(7), capacity: 2, status: "published" } });
  check("programme is published", programme.status === 201, brief(programme.data));
  const programId = programme.data.item?.id;
  check("programme appears on /programmes", (await page("/programmes")).includes(`E2E programme ${RUN}`));
  check("registration 1 is accepted", (await call("POST", "/api/programmes/register", { cookie: aCookie, json: { programId, name: "E2E Farmer A", email: email("a") } })).status === 201);
  check("duplicate registration is rejected", [400, 409].includes((await call("POST", "/api/programmes/register", { json: { programId, name: "E2E Farmer A", email: email("a") } })).status));
  check("registration 2 is accepted", (await call("POST", "/api/programmes/register", { json: { programId, name: "E2E Farmer B", email: email("b") } })).status === 201);
  check("capacity is enforced", (await call("POST", "/api/programmes/register", { json: { programId, name: "E2E Farmer C", email: email("c") } })).status === 409);
  const [registration] = await sql`SELECT id FROM training_registrations WHERE email = ${email("a")} LIMIT 1`;
  check("attendance is recorded", (await call("PATCH", `/api/admin/training-registrations/${registration?.id}`, { cookie: adminCookie, json: { attendanceStatus: "attended" } })).status === 200);

  section("Sitemap");
  const sitemap = await page("/sitemap.xml");
  check("sitemap lists published content", [slug("project"), slug("course"), slug("programme")].every((s) => sitemap.includes(s)));
  check("sitemap omits unpublished content", !sitemap.includes(slug("article")));

  section("Password reset");
  check("unknown email gets the generic reply", (await call("POST", "/api/auth/forgot-password", { json: { email: email("nobody") } })).status === 200);
  check("reset request for a real account issues a token", (await call("POST", "/api/auth/forgot-password", { json: { email: email("a") } })).status === 200 && (await sql`SELECT count(*)::int AS n FROM password_reset_tokens WHERE user_id = ${aId}`)[0].n === 1);
  const rawToken = randomBytes(32).toString("hex"); // emails aren't sent in tests, so plant a known token
  await sql`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (${aId}, ${createHash("sha256").update(rawToken).digest("hex")}, NOW() + INTERVAL '30 minutes')`;
  check("password is reset with a valid token", (await call("POST", "/api/auth/reset-password", { json: { token: rawToken, password: "E2eNewPassword#A2" } })).status === 200);
  check("existing sessions are signed out", (await call("GET", "/api/auth/session", { cookie: aCookie })).data.user === null);
  check("reset token cannot be reused", (await call("POST", "/api/auth/reset-password", { json: { token: rawToken, password: "E2eOtherPassword#3" } })).status === 400);
  check("new password works", (await call("POST", "/api/auth/login", { json: { email: email("a"), password: "E2eNewPassword#A2" } })).status === 200);
  check("old password no longer works", (await call("POST", "/api/auth/login", { json: { email: email("a"), password: "E2ePassword#A1" } })).status === 401);

  section("Scheduled jobs");
  const expectedCron = process.env.RESEND_API_KEY ? [200] : [503]; // 503 = email provider not configured
  check("follow-up job rejects requests without the secret", (await call("GET", "/api/cron/followups")).status === 401);
  const followups = await call("GET", "/api/cron/followups", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
  check("follow-up job runs with the secret", expectedCron.includes(followups.status), `${followups.status} ${brief(followups.data)}`);
  const reminders = await call("GET", "/api/cron/programme-reminders", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
  check("programme reminder job runs with the secret", expectedCron.includes(reminders.status), `${reminders.status} ${brief(reminders.data)}`);
} catch (error) {
  check("suite completed without crashing", false, error instanceof Error ? error.stack : String(error));
} finally {
  const pattern = `e2e.%.${RUN}@example.com`, slugPattern = `e2e-%-${RUN}`;
  await sql`DELETE FROM training_registrations WHERE email LIKE ${pattern}`;
  await sql`DELETE FROM training_programs WHERE slug LIKE ${slugPattern}`;
  await sql`DELETE FROM articles WHERE slug LIKE ${slugPattern}`;
  await sql`DELETE FROM projects WHERE slug LIKE ${slugPattern}`;
  await sql`DELETE FROM courses WHERE slug LIKE ${slugPattern}`;
  await sql`DELETE FROM inquiries WHERE email LIKE ${pattern}`;
  await sql`DELETE FROM appointments WHERE email LIKE ${pattern}`;
  await sql`DELETE FROM farm_plans WHERE email LIKE ${pattern}`;
  await sql`DELETE FROM crop_cases WHERE email LIKE ${pattern}`;
  await sql`DELETE FROM newsletter_subscribers WHERE email LIKE ${pattern}`;
  await sql`DELETE FROM notification_log WHERE recipient LIKE ${pattern}`;
  await sql`DELETE FROM users WHERE email LIKE ${pattern}`;
  await sql.end();
  console.log(`\n${passed} passed, ${failures.length} failed${failures.length ? `\nFailed:\n  - ${failures.join("\n  - ")}` : ""}`);
  process.exitCode = failures.length ? 1 : 0;
}
