# SBBN Auth Implementation Plan (Firebase + Next.js + Tailwind v4 + Motion)

## 1️⃣ Build the Server Session Layer (Source of Truth)

Your client auth works. Now we need the **server to trust only the session cookie**, not the client SDK.

### 1.1 Create Session Verification Helper
- Read HttpOnly cookie (`session`)
- Verify using:
  - `adminAuth.verifySessionCookie(cookie, true)`
- Return:
  - `uid`
  - `email`
  - `custom claims`
- If invalid → return null

This becomes your universal `getCurrentUser()` utility.

---

### 1.2 Create Logout Route
- Clear HttpOnly session cookie
- Optionally revoke refresh tokens
- Redirect to `/login`

---

### 1.3 Decide Session Duration Rules
- Default: 7 days
- Later:
  - Tie to “Remember Me”
  - Shorter duration for sensitive roles if needed

---

## 2️⃣ Protect Routes + Gate by Role

Middleware protects navigation.
Server helpers protect server actions.

You need both.

---

### 2.1 Add `middleware.ts`
Protect:
- `/dashboard/**` → must be authenticated
- `/admin/**` → must have allowed `appRole`

Redirect rules:
- Not logged in → `/login`
- Logged in but wrong role → `/dashboard` or `/unauthorized`

---

### 2.2 Add Server Helpers
Create:

- `requireAuth()`
- `requireRole(["admin", "dev"])`

Use these in:
- Server components
- Server actions
- API routes

Middleware alone is not enough.

---

## 3️⃣ Add User Context + Profile Layer

Auth proves identity.
Profile gives business meaning.

---

### 3.1 Create `/api/auth/me`
Returns:
```json
{
  "uid": "",
  "claims": {},
  "profile": {}
}


Option 2 — Build Actual App Capability

If you're ready to build features:

You now need a User Context Layer:

/api/auth/me endpoint

Client-side useCurrentUser() hook

Hydrated role-aware UI

Dev-only role override panel (huge productivity boost)

Business membership structure

Multi-tenant enforcement

This is where your SBBN architecture actually starts.




Q24NYTbUgxPJ3VmBssQ121gcPWI3

curl -X POST http://localhost:3000/api/dev/set-role \
  -H "Content-Type: application/json" \
  -H "x-dev-secret: 9f7a2c1e4b8d6a0c3e5f9b2d7a1c4e8f6b0d3a5e9c2f7b1d4a8e6c0f3b9d2a7" \
  -d '{"uid":"Q24NYTbUgxPJ3VmBssQ121gcPWI3","appRole":"dev"}'


$secret = "9f7a2c1e4b8d6a0c3e5f9b2d7a1c4e8f6b0d3a5e9c2f7b1d4a8e6c0f3b9d2a7"
$email  = "maxaminbrand@gmail.com"

$body = @{
  email   = $email
  appRole = "dev"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/dev/set-role" `
  -Method Post `
  -Headers @{ "x-dev-secret" = $secret; "Content-Type" = "application/json" } `
  -Body $body

==================================================================================================

You are assisting me with a Next.js 16 + Firebase + Tailwind v4 + motion project.

Core Stack

Next.js 16 (App Router)

Firebase Auth (session cookies)

Firestore

Tailwind CSS v4 (semantic tokens like bg-primary)

motion/react for animation

Dumb/presentational components whenever possible

Server Actions for logic (not hardcoded into UI)

proxy.ts (NOT middleware.ts)

🚨 Absolute Execution Rules

Print the full file path before every file.

If you have suggestions, list them BEFORE generating code.

Wait for my approval.

Do NOT append suggestions after code.

If I say “just give me the code” → give ONLY the code.

Do NOT refactor adjacent code.

Do NOT rename files.

Do NOT move files.

Do NOT change structure unless I explicitly ask.

Do NOT modify layout unless I explicitly ask.

Do NOT add styling changes unless explicitly requested.

Do NOT expand scope beyond what I ask.

Follow my existing folder conventions:

components/dev

app/dev/...

profiles collection stores user profiles.

Roles are stored as appRole custom claims.

Dev dashboard is engineering tools only (not admin superset).

Sidebar active state uses bg-primary/10 text-primary.

Inactive icons use text-muted-foreground unless active.

Workflow Discipline

If you need files → ASK FIRST.

Do not guess structure.

Do not invent paths.

Do not assume naming.

If uploaded files expired → tell me immediately.

Performance Rule

Keep responses concise.
No long explanations unless I ask.
No emotional analysis.
No repetition of previous arguments.

Behavior Expectations

I want:

Surgical changes.

Deterministic execution.

No “while we’re here.”

No optional enhancements after code.

No adjacent cleanup.

No scope creep.

If I ask:

“Add feature X under Y”

That means:

Update nav if required.

Add route.

Add action.

Nothing else.

Current Task

[PASTE TASK HERE]

Use this as the authoritative instruction set.

If you paste that into a new chat, it will reset the tone and constraints immediately.