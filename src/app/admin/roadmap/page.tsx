import { PageHeader } from '@/components/admin/ui';

export const metadata = {
  title: 'Beehiiv Setup Roadmap - TML Today Admin',
  robots: { index: false, follow: false },
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-xl font-black text-brand">
        <span className="mr-2 text-slate-400">{number}.</span>
        {title}
      </h3>
      <div className="mt-4 space-y-4 text-sm text-slate-700">{children}</div>
    </section>
  );
}

function Table({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {rows.map(([label, value], index) => (
        <div
          key={label}
          className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4 ${index > 0 ? 'border-t border-slate-200' : ''}`}
        >
          <span className="w-full shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500 sm:w-48">{label}</span>
          <span className="text-slate-800">{value}</span>
        </div>
      ))}
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

function EmailPreview({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Subject</p>
      <p className="mb-3 font-semibold text-slate-800">{subject}</p>
      <p className="whitespace-pre-line text-slate-700">{body}</p>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-slate-400" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function BeehiivRoadmapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Internal · not indexed"
        title="Beehiiv Setup Roadmap"
        description="The complete free-plan setup guide, from new account to a live TML Today newsletter. October 2026."
      />

      <section className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
        <h3 className="text-base font-black uppercase tracking-wide text-amber-700">Rick&apos;s notes before you build this</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Confirm the live domain first.</strong> This guide assumes <code>tmltoday.com</code> is already serving the site, but{' '}
            <code>src/app/robots.ts</code> and <code>src/app/sitemap.ts</code> currently hardcode{' '}
            <code>https://tmltoday.couchmanrick.workers.dev</code> as the canonical URL. If the custom domain isn&apos;t mapped in
            Cloudflare yet, every link this guide tells you to hand out (<code>/newsletter</code>, the thank-you page, signup
            success redirects) needs to point at whichever domain is actually live, or subscribers land on a broken link.
          </li>
          <li>
            <strong>Section 9 — use <code>afterInteractive</code>, not <code>lazyOnload</code>, for the embed script.</strong>{' '}
            <code>lazyOnload</code> defers the script until the browser is idle, which can leave a visible signup form
            non-functional for a few seconds on a slow connection — a bad first impression on the one page whose entire job
            is capturing an email. <code>afterInteractive</code> (Next.js&apos;s default for third-party widgets) loads it
            right after hydration instead.
          </li>
          <li>
            <strong>The consent wording has a placeholder.</strong> &quot;[legal publishing business name]&quot; in section 12 needs
            your actual registered business name before it ships — CASL requires the sender to be identifiable, and a bracketed
            placeholder obviously isn&apos;t.
          </li>
          <li>
            <strong><code>/newsletter/thank-you</code> doesn&apos;t exist yet.</strong> The site currently has{' '}
            <code>/newsletter</code> (signup), <code>/newsletter/archive</code>, and <code>/newsletter/[date]</code> (per-day
            editions pulled from the aggregated content feed) — a separate, simpler confirmation page per this guide&apos;s
            section 8 still needs to be built before you point Beehiiv&apos;s form redirect at it.
          </li>
          <li>
            Everything else below tracks the source document as given — plan numbers, free-plan limits, and Beehiiv UI labels
            are per Beehiiv as of October 2026 and may drift; the guide&apos;s own advice to re-check{' '}
            <a href="https://www.beehiiv.com/pricing" className="underline">beehiiv.com/pricing</a> before upgrading is worth
            following literally.
          </li>
        </ul>
      </section>

      <Section number="1" title="Free-plan features and limitations">
        <Table
          rows={[
            ['Subscriber allowance', 'Up to 2,500 active subscribers'],
            ['Newsletter sends', 'Unlimited'],
            ['Signup forms and hosted pages', 'Included'],
            ['One-off welcome email', 'Available via preset emails'],
            ['Multi-step automated sequences', 'Paid feature'],
            ['Custom branded web/sending domains', 'Paid feature'],
            ['Publication / team seats', 'One publication and one seat'],
          ]}
        />
        <p className="text-slate-500">
          Beehiiv features and pricing can change. Confirm current limits at{' '}
          <a href="https://www.beehiiv.com/pricing" className="text-brand underline">beehiiv.com/pricing</a> before upgrading.
        </p>
      </Section>

      <Section number="2" title="Publication profile and branding">
        <Steps
          items={[
            'Sign into app.beehiiv.com and select your publication.',
            'Open Settings and find publication/general details.',
            'Enter the name, description, URL, language, and timezone.',
            'Upload the existing TML Today logo and save.',
          ]}
        />
        <Table
          rows={[
            ['Name', 'TML Today'],
            ['Description', 'Toronto Maple Leafs news, rumours, analysis and updates.'],
            ['Primary website', 'https://tmltoday.com'],
            ['Category', 'Sports / Hockey (if available)'],
            ['Language / timezone', 'English / America/Toronto'],
            ['Cadence', 'Daily'],
            ['Display author', 'TML Today'],
          ]}
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Long publication description</p>
          <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
            TML Today delivers the latest Toronto Maple Leafs news, trade rumours, game recaps, analysis and updates straight
            to your inbox. Stay connected to everything happening with the Leafs in one convenient newsletter, built for fans
            who bleed blue and white.
          </p>
        </div>
      </Section>

      <Section number="3" title="URLs and domains">
        <Table
          rows={[
            ['Main site', 'https://tmltoday.com'],
            ['Newsletter page to build in Next.js', '/newsletter'],
            ['Thank-you page to build', '/newsletter/thank-you'],
            ['Beehiiv-hosted page', 'Your assigned *.beehiiv.com address (verify in Domains)'],
            ['Possible future paid custom domain', 'newsletter.tmltoday.com'],
          ]}
        />
        <p className="text-slate-500">
          Do not transfer the domain, change nameservers, or alter Cloudflare DNS for the basic free-plan integration. The
          Next.js newsletter and thank-you pages must actually exist before linking or redirecting to them.
        </p>
      </Section>

      <Section number="4" title="Sender identity and reply-to address">
        <Steps
          items={[
            'In Settings, open the email/sender configuration.',
            'Set sender display name to TML Today.',
            'Create and test newsletter@tmltoday.com as a valid mailbox or alias in your email provider.',
            'Use that address as Reply-to if Beehiiv allows it; verify incoming replies.',
            'Use Beehiiv-provided authenticated sending infrastructure on the free plan rather than assuming custom-domain sending is included.',
          ]}
        />
      </Section>

      <Section number="5" title="Enable double opt-in">
        <Steps
          items={[
            'Go to Settings > Emails > Preset Emails (labels may differ).',
            'Enable Double Opt-in.',
            'Open the confirmation email editor, add the copy below, and preserve the functional confirmation button.',
            'Optionally enable Beehiiv’s confirmation reminder (“Smart Nudge”) if offered.',
            'Test that a new contact stays pending until they click confirmation.',
          ]}
        />
        <EmailPreview
          subject="One More Step — Confirm Your TML Today Subscription"
          body={`Welcome to TML Today!

You're almost on the roster! Please confirm your email address by clicking the confirmation button below.

Once confirmed, you'll receive Toronto Maple Leafs news, trade rumours, game recaps and more directly in your inbox.

Go Leafs Go!
The TML Today Team

If you didn't request this subscription, you can ignore this message.`}
        />
      </Section>

      <Section number="6" title="Create the welcome email">
        <Steps
          items={[
            'In the email preset settings, locate Welcome Email.',
            'Enable the standard welcome email and select Edit.',
            'Customize the subject, text, logo and links.',
            'Send a test and save.',
          ]}
        />
        <EmailPreview
          subject="Welcome to TML Today — You're on the Roster!"
          body={`Welcome to TML Today!

You're officially part of the lineup! Here's what you can expect:
• Latest Leafs News — major headlines and developments
• Trade Rumours — roster changes and potential moves
• Game Recaps — key moments and takeaways
• Analysis — stories and opinions for Leafs fans
• Around Leafs Nation — fan discussions and perspectives

Visit tmltoday.com for continuing coverage. Add this address to your contacts so we stay out of the spam folder.

Go Leafs Go!
The TML Today Team
The pulse of Leafs Nation.`}
        />
      </Section>

      <Section number="7" title="Build the main Beehiiv signup form">
        <Steps
          items={[
            'Go to Subscribers > Subscribe Forms and create a new form.',
            'Name it "TML Today - Website Main Signup".',
            'In Content, configure title, description, required email field, consent wording and button.',
            'In Style, choose navy/dark blue, white text and a bright-blue Subscribe button.',
            'In Settings, choose a success message or redirect to a live thank-you page.',
            'Publish, then copy Beehiiv’s actual embed code exactly as supplied.',
          ]}
        />
        <Table
          rows={[
            ['Form title', 'Never Miss a Leafs Headline'],
            ['Subtitle', 'Get Leafs news, trade rumours, game recaps and analysis delivered straight to your inbox. Free.'],
            ['Field', 'Email only (required)'],
            ['Button', 'Subscribe Free'],
            ['Consent note', 'Free newsletter. Unsubscribe anytime. See our privacy policy.'],
            ['Success message', 'Check your inbox and confirm your email to join TML Today!'],
          ]}
        />
        <p className="text-slate-500">
          Use the success message initially. Once <code>/newsletter/thank-you</code> exists, you can redirect there and tell
          users they still need to confirm the email.
        </p>
      </Section>

      <Section number="8" title="Build the landing page on TMLtoday.com">
        <Steps
          items={[
            'Create /newsletter in the Next.js app.',
            'Add a clear headline, four newsletter benefits, a Beehiiv signup form and privacy/consent language.',
            'Create /newsletter/thank-you explaining double opt-in confirmation.',
            'Link /newsletter from the site header and articles.',
          ]}
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Suggested landing-page copy</p>
          <p className="mt-1 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">{`JOIN LEAFS NATION'S DAILY NEWSLETTER

Toronto Maple Leafs news, delivered to your inbox.

From breaking news and trade rumours to game recaps and analysis, TML Today helps you follow the stories that matter.

You'll get: latest headlines; trade rumours and roster updates; game previews and recaps; and stories from Leafs Nation.

Subscribe for free. Stay informed. Stay connected. Go Leafs Go!`}</p>
        </div>
      </Section>

      <Section number="9" title="Connect the Beehiiv embed to Next.js">
        <p>
          Use the exact HTML or script generated by Beehiiv. Do not invent an iframe URL or script src. If using a Next.js
          client component, ensure the vendor script runs after the required DOM container mounts, and test both direct loads
          and client-side navigation.
        </p>
        <p>
          Suggested placement: a Newsletter link in the header, an embedded signup module below news articles, and a small
          signup form in the site footer. Create separate forms by placement if you want attribution reporting.
        </p>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Conceptual React placement (replace with the real Beehiiv embed)
          </p>
          <pre className="mt-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
{`"use client";
import Script from "next/script";

export default function BeehiivSignup() {
  return (
    <section aria-label="Subscribe to TML Today">
      <Script src="PASTE_REAL_BEEHIIV_SCRIPT_URL" strategy="afterInteractive" />
    </section>
  );
}`}
          </pre>
          <p className="mt-2 text-slate-500">
            This snippet is only a placement illustration — some Beehiiv embeds need additional markup or attributes. Follow
            Beehiiv&apos;s published embed instructions for the real code, and note the <code>strategy</code> change from the
            original guide&apos;s <code>lazyOnload</code> (see notes above).
          </p>
        </div>
      </Section>

      <Section number="10" title="Track signup sources">
        <Table
          rows={[
            ['TML - Homepage', 'Home page'],
            ['TML - Article Footer', 'End of article'],
            ['TML - Site Footer', 'Sitewide footer'],
            ['TML - Newsletter Page', '/newsletter'],
            ['TML - Forum', 'Forum link or placement, if supported'],
          ]}
        />
        <p className="text-slate-500">
          Inspect available form statistics and UTM options in Beehiiv. Track new confirmed subscribers and which placements
          produce them.
        </p>
      </Section>

      <Section number="11" title="Create a reusable daily newsletter template">
        <Steps
          items={[
            'Use New > Template Post (or the editor’s template workflow).',
            'Add logo, branding and date to the header.',
            'Create repeating sections: Top Stories, Trades and Rumours, Game Day/Recap, and Around Leafs Nation.',
            'Link story summaries back to articles on TMLtoday.com.',
            'Add the forum link and website call-to-action.',
            'Prepare the email subject and preview text; send a preview before publishing.',
          ]}
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sample newsletter structure</p>
          <pre className="mt-1 whitespace-pre-line overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
{`TML TODAY — YOUR DAILY LEAFS FIX
[Date] • Good Morning, Leafs Nation!

TOP STORIES
1. Biggest Leafs headline — 2-3 sentence summary and source link.
2. Latest trade/roster development — summary and link.
3. Around the NHL — headline and link.

GAME DAY / RECAP
Score, schedule, noteworthy performance or game preview.

AROUND LEAFS NATION
Featured discussion from forums.tmltoday.com.

MORE LEAFS NEWS: tmltoday.com`}
          </pre>
        </div>
      </Section>

      <Section number="12" title="Privacy, consent and unsubscribe compliance">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Identify the publishing business in signup consent wording and newsletters.</li>
          <li>Use clear opt-in language and keep records of consent; double opt-in is recommended.</li>
          <li>Ensure every marketing email has a valid unsubscribe mechanism and contact information.</li>
          <li>Add an accessible privacy policy describing newsletter data processing.</li>
          <li>Include a legitimate mailing address required by the sending platform and applicable laws.</li>
          <li>Do not import forum members or site visitors without an appropriate consent basis.</li>
        </ul>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Suggested consent wording</p>
          <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-4 italic text-slate-700">
            &quot;Subscribe to receive TML Today email updates from [legal publishing business name], including Toronto Maple
            Leafs news and analysis. Unsubscribe anytime. Contact: newsletter@tmltoday.com.&quot;
          </p>
        </div>
        <p className="text-slate-500">
          Canadian Anti-Spam Legislation may apply. This guide is operational guidance, not legal advice.
        </p>
      </Section>

      <Section number="13" title="Test before launch">
        <Checklist
          items={[
            'Publication profile and logo correct',
            'Hosted Beehiiv URL opens',
            'Reply-to address receives replies',
            'Double opt-in confirmation works',
            'Unconfirmed readers stay pending',
            'Welcome email arrives after confirmation',
            'Signup displays on desktop and mobile',
            'Thank-you page correctly explains confirmation',
            'Subscribers show up in Beehiiv',
            'Test newsletter delivers, with working links',
            'Legal contact information and unsubscribe link appear',
            'Unsubscribe stops future mail',
          ]}
        />
      </Section>

      <Section number="14" title="Metrics to track">
        <Table
          rows={[
            ['New subscribers', 'Newsletter list growth'],
            ['Confirmation rate', 'Quality of signup/opt-in flow'],
            ['Open rate', 'Headline and audience engagement'],
            ['Link clicks', 'Traffic driven back to TMLtoday.com'],
          ]}
        />
      </Section>

      <Section number="15" title="Future automation (after the manual launch)">
        <p>
          Potential future workflow: aggregator collects Leafs stories → AI-assisted editorial draft → human news and source
          verification → Beehiiv post or publication workflow. Check free-plan API scopes and limitations before building a
          fully automated integration.
        </p>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recommended launch order</p>
          <Steps
            items={[
              'Finish publication settings and sender identity.',
              'Enable double opt-in.',
              'Customize welcome email.',
              'Publish and test first embedded form.',
              'Create /newsletter and thank-you pages in Next.js.',
              'Add the signup module to articles and footer.',
              'Create the reusable daily issue template.',
              'Test complete subscribe and unsubscribe flows; send the first real issue.',
            ]}
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Useful links</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li><a href="https://app.beehiiv.com" className="text-brand underline">Beehiiv dashboard</a></li>
            <li><a href="https://www.beehiiv.com/pricing" className="text-brand underline">Pricing and features</a></li>
            <li><a href="https://www.beehiiv.com/support/article/12977090590487" className="text-brand underline">Embedded forms help</a></li>
            <li><a href="https://tmltoday.com" className="text-brand underline">TML Today</a></li>
          </ul>
        </div>
      </Section>
    </div>
  );
}
