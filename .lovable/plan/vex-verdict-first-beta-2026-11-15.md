# Vex: verdict-first beta

## Outcome
Make Vex the AI board that tells first-time founders whether to build an idea or kill it. Keep the dark purple identity, lime calls to action, and phone-first layout. Preserve existing accounts and reports while adding the new visitor journey.

## 1. Clean up the landing page and sign-in
- Remove generic automation, process, benefits, pricing tiers, FAQ and dead demo content from the landing page.
- Use your exact headline, a plain-spoken subhead and idea entry directly on the first screen.
- Reorder the page: idea entry → genuine sample report → five advisors → simplified 10-minute timeline → roadmap focus → who it is for → beta pricing feedback → factual FAQ → Privacy, Terms, Contact.
- Use exactly CEO, Execution Officer, Risk Analyst, Psychologist and Industry Expert everywhere, each with a distinct colour and one-line personality.
- Accept any valid email in both the signup form and account-creation rules. Add Continue with Google; keep email verification.
- Remove the Lovable badge only if the workspace plan permits it.

## 2. Deliver the free, researched verdict
- Accept an idea up to 1,500 characters and an optional intended audience without account creation.
- Search for competitors, pricing and regulatory issues before scoring. Link only competitors present in retrieved evidence; use “pricing unverified” when pricing is not supported.
- Validate the complete result before displaying verdict, score, four sub-scores, one-liner, three risks, killer question, competitors, regulatory flags, confidence and what could change the board's mind.
- If search fails, label competitors unverified, lower confidence, and never fabricate evidence.
- Show truthful progress states for research and board assessment, preserve input on failure and use friendly error messages.
- Reject empty, clearly meaningless or abusive ideas server-side and treat submitted text and search excerpts as untrusted data, not instructions.

## 3. Make results shareable without exposing reports
- Generate downloadable 1080×1920 verdict cards and 1200×630 preview images from actual results.
- Sharing stays opt-in. Public `/r/:id` pages contain only verdict, score and one-liner, not the submitted idea or private report.
- Generate the sample by running the real research and validation flow; never substitute a handwritten report.
- Provide working Download image and Copy link actions, including clear failure states.

## 4. Unlock full reports and save progress
- Let visitors unlock with verified email or Google and attach their anonymous result securely to their account.
- Save the five-advisor debate, disagreements and unified decision; four-phase roadmap (Foundations → MVP → Launch → Iterate); skill-adapted build plan; and launch plan.
- Add My ideas with verdicts and dates, per-idea assumptions derived from risks, custom assumptions and completion checkboxes.
- Add Delete my data with confirmation and deletion of owned reports, assumptions and public shares.
- Add optional weekly assumption reminders with an easy off switch once a suitable email sender is configured.

## 5. Test pricing and measure conversion
- Replace pricing with: “Vex is free during beta. After beta, full reports are planned at $9 each.”
- Record Yes / Maybe / No and an optional comment without taking payments.
- Measure submission, verdict, sharing, email, full-report, price-intent, tracker and seven-day return events without personal data or idea text in event payloads.
- Use the platform's existing page-view measurement rather than double-counting it.
- Add a server-authorized admin view with event counts and submission-to-email conversion; never infer admin permission from browser storage.

## Technical approach and safeguards
- Use Lovable Cloud functions for research, validation, ownership transfer, public sharing and privileged deletion. Keep secrets server-side.
- Use explicit table grants and owner-only row-level access. Anonymous reports are accessible only through a private capability, never a public table read.
- Atomically enforce three anonymous runs per UTC day using a salted IP hash plus a browser identifier. Enforce the IP quota separately so changing the browser identifier cannot reset it.
- **Rate-limit tradeoff:** Lovable has no built-in rate-limit service for generated apps. Implement an application-owned, server-side counter. Shared networks may share an IP allowance; signing in provides a separate account allowance. Raw IP addresses are not stored.
- Cache identical normalized idea-and-audience inputs for 24 hours without making private submissions publicly readable. Count submissions against limits even when cached.
- Start with three full-report generations per verified account per day; show the remaining allowance. Reuse saved reports without charging another generation.
- Apply bounded search retries and timeouts, output-token budgets, and durable request identifiers. Retry once only when it is safe; do not automatically duplicate an AI request whose outcome is unknown.
- Keep the existing React app. Its current client-only hosting cannot provide unique social preview tags to non-JavaScript crawlers at `/r/:id`; use a server-served share response where supported, or identify that remaining hosting limitation before claiming link previews work.
- Keep the existing security workflow isolated from app behavior.

## Required connections and decisions
- Google is now enabled; the signup form and domain restriction still need updating.
- No web-search connection is available yet. Open the Parallel connection card so you can configure search securely; do not ship invented competitors if connection setup is skipped.
- No email sender domain is configured. Weekly reminders need a domain you own and an appropriate reminder email service; authentication emails can continue using the existing sender.
- Confirm an admin account through a protected role assignment before testing the admin view; do not select an account arbitrarily.
- Check whether badge removal is allowed before changing it.

## Verification
- Add and run focused tests for 1,500-character input limits, three-per-day quotas, 24-hour caching, evidence-only competitor URLs, output validation, privacy and account ownership.
- Test on narrow phone and desktop screens for readable text, thumb-sized buttons, visible focus and no overlap.
- Run the visitor journey with a real idea and real search results, download a card, open the public summary, unlock and read the saved report with an authenticated account, and confirm assumptions and deletion behavior.
- Test quota, invalid input, failed search and failed generation states. Verify admin denial for ordinary accounts and successful counts for the authorized admin.
- Report any incomplete connection-dependent work explicitly; do not label untested flows complete.