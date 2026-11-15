import { LegalPage } from "@/components/landing/LegalPage";
import { CONTACT_EMAIL } from "@/components/landing/Footer";

const PrivacyPolicy = () => (
  <LegalPage title="Privacy Policy" updated="15 November 2026">
    <p>This explains what Vex collects, why, and what you can do about it. Plain language, no tricks.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Your idea and "who it's for"</strong>, when you run a verdict. We store them with the result so we can show it to you and, if you sign in, save it to your account.</li>
      <li><strong>Your email address</strong>, if you sign up, sign in with Google or ask for a sign-in link. We use it to sign you in and save your reports.</li>
      <li><strong>A hashed version of your IP address</strong> and a random browser id, to limit free runs to 3 a day. We never store your raw IP address.</li>
      <li><strong>Anonymous usage events</strong> such as "idea submitted" or "share link copied", with a random browser id and the page path. These events never contain your idea, email or account id.</li>
      <li><strong>Your answer to "Would you pay this?"</strong> and any comment you add.</li>
      <li><strong>Your assumptions checklist</strong> and whether you turned on weekly check-in emails.</li>
    </ul>

    <h2>Who processes it</h2>
    <ul>
      <li>Your idea text is sent to our AI provider (through the Lovable AI gateway) to produce the verdict and report.</li>
      <li>Short search queries derived from your idea are sent to our web search provider (Tavily) to find competitors, prices and regulations.</li>
      <li>Data is stored with our hosting and database provider (Lovable Cloud, built on Supabase).</li>
      <li>If you turn on weekly check-ins, your email address is passed to our email delivery provider to send them.</li>
    </ul>
    <p>We don't sell your data and we don't use your ideas to advertise to you.</p>

    <h2>Sharing</h2>
    <p>Ideas are private by default. If you press Share, we create a public page that shows your verdict, score, one-line summary and the first 80 characters of your idea, plus a preview image of the same. The full report is never public. You can turn the link off at any time, which removes the page and its image.</p>

    <h2>How long we keep it</h2>
    <ul>
      <li>Saved ideas and reports: until you delete them or your account.</li>
      <li>Free runs you never sign in to claim: we plan to delete them after 30 days.</li>
      <li>Rate-limit counters: kept by day, with hashed keys only.</li>
      <li>Cached results for identical ideas: 24 hours.</li>
    </ul>

    <h2>Cookies and local storage</h2>
    <p>We use your browser's local storage to keep you signed in, remember results from free runs on this device, and hold a random id for anonymous analytics. If you decline in the cookie banner, the analytics id only lasts for your current session.</p>

    <h2>Your choices</h2>
    <ul>
      <li>Delete any assumption or stop sharing any idea at any time.</li>
      <li>Use <strong>Delete my data</strong> on the My ideas page to permanently delete your account, ideas, reports, checklists and share links.</li>
      <li>Turn weekly check-ins off on the My ideas page or from the link in any check-in email.</li>
    </ul>

    <h2 id="contact">Contact</h2>
    {CONTACT_EMAIL ? (
      <p>
        Questions or requests about your data: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ) : (
      <p>A contact email address is coming soon. Until then, you can delete your data yourself from the My ideas page.</p>
    )}
  </LegalPage>
);

export default PrivacyPolicy;
