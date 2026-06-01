// app/privacy/page.tsx
// Public route: pablock.app/privacy
//
// Static privacy policy for VOID by ZVRI Studio. Server-rendered, no JS,
// no external deps beyond Tailwind. Drop into /app/privacy/page.tsx and
// it works on the next deploy.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — VOID",
  description:
    "Privacy Policy for VOID, a private visual workspace by ZVRI Studio.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-zinc-200">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← Back
      </Link>

      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          ZVRI Studio — VOID Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          <strong className="font-medium text-zinc-300">Last updated:</strong>{" "}
          June 1, 2026
        </p>
      </header>

      <div className="space-y-6 text-[15px] leading-relaxed">
        <p>
          VOID is a private visual workspace created by{" "}
          <strong className="font-semibold text-zinc-100">ZVRI Studio</strong>.
          VOID allows users to connect their creative accounts, such as
          Pinterest and Are.na, and organize their saved visual references on a
          private infinite canvas.
        </p>
        <p>
          This Privacy Policy explains what information we collect, how we use
          it, and how we protect your data.
        </p>

        <Section title="1. Information We Collect">
          <p>When you use VOID, we may collect the following information:</p>

          <SubSection title="Account information">
            <p>
              When you sign in or connect an external account, we may collect
              basic account information such as:
            </p>
            <List
              items={[
                "Your name or username",
                "Your email address, if provided by the connected service",
                "Your profile image, if provided by the connected service",
                "Your connected account ID",
              ]}
            />
          </SubSection>

          <SubSection title="Pinterest and Are.na content">
            <p>
              If you connect your Pinterest or Are.na account, VOID may request
              read-only access to your saved content, including:
            </p>
            <List
              items={[
                "Pinterest boards",
                "Pinterest pins",
                "Pin titles, descriptions, image URLs, and source URLs",
                "Are.na channels",
                "Are.na blocks, images, links, thumbnails, and related metadata",
              ]}
            />
            <p>
              VOID only uses this information to display your own saved content
              inside your private canvas.
            </p>
          </SubSection>

          <SubSection title="Canvas layout data">
            <p>
              VOID may store information about how you organize your content,
              including:
            </p>
            <List
              items={[
                "Node positions",
                "Groups",
                "Labels",
                "Filters",
                "Canvas layout preferences",
              ]}
            />
            <p>
              This allows your workspace to be saved and restored when you
              return.
            </p>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>
            We use your information only to provide and improve the VOID
            experience.
          </p>
          <p>Specifically, we use your data to:</p>
          <List
            items={[
              "Authenticate your account",
              "Connect your Pinterest or Are.na account",
              "Display your saved visual content on your private canvas",
              "Save your canvas layout and organization",
              "Provide filters, groups, and workspace functionality",
              "Maintain security and prevent misuse",
            ]}
          />
          <p>
            VOID does <strong className="font-semibold text-zinc-100">not</strong>{" "}
            use your data for advertising, third-party tracking, or public
            discovery feeds.
          </p>
        </Section>

        <Section title="3. Read-Only Access">
          <p>VOID only requests read-only permissions from connected services.</p>
          <p>We do not:</p>
          <List
            items={[
              "Create pins",
              "Edit pins",
              "Delete pins",
              "Post to your Pinterest account",
              "Modify your Are.na content",
              "Share your content publicly",
              "Sell your personal data",
            ]}
          />
        </Section>

        <Section title="4. Image Storage">
          <p>
            VOID does not store copies of your Pinterest or Are.na images on
            its own servers.
          </p>
          <p>
            Images are loaded directly from the original source or CDN provided
            by the connected platform.
          </p>
          <p>
            VOID may store only metadata required to display and organize your
            content, such as image URLs, titles, source links, and canvas
            positions.
          </p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>
            VOID may use third-party services to operate the application,
            including:
          </p>
          <List
            items={[
              "Authentication providers",
              "Database and hosting providers",
              "Pinterest API",
              "Are.na API",
              "Supabase",
              "Vercel",
            ]}
          />
          <p>
            These services may process data according to their own privacy
            policies.
          </p>
        </Section>

        <Section title="6. Data Sharing">
          <p>
            VOID does not sell, rent, or trade your personal information.
          </p>
          <p>We may only share limited data when necessary to:</p>
          <List
            items={[
              "Operate the application",
              "Comply with legal obligations",
              "Protect the security of VOID and its users",
              "Use trusted infrastructure providers required to run the service",
            ]}
          />
        </Section>

        <Section title="7. Data Retention">
          <p>
            We keep your account and canvas data for as long as your account is
            active or as needed to provide the service.
          </p>
          <p>
            You may request deletion of your account and associated data at any
            time by contacting us.
          </p>
        </Section>

        <Section title="8. User Control">
          <p>
            You may disconnect your Pinterest or Are.na account at any time.
          </p>
          <p>
            You may also request that we delete your stored account data,
            connected account data, and canvas layout data.
          </p>
        </Section>

        <Section title="9. Security">
          <p>
            We take reasonable technical and organizational measures to protect
            your information.
          </p>
          <p>
            However, no online service can guarantee complete security. You are
            responsible for keeping your account credentials secure.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            VOID is not intended for children under the age of 13. We do not
            knowingly collect personal information from children.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. If we make
            significant changes, we will update the &ldquo;Last updated&rdquo;
            date at the top of this page.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about this Privacy Policy or to request deletion of
            your data, contact:
          </p>
          <p>
            <strong className="font-semibold text-zinc-100">ZVRI Studio</strong>
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 pt-4">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 pt-2">
      <h3 className="text-base font-medium text-zinc-100">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-6 marker:text-zinc-500">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}