import React from 'react';
import { Link } from 'react-router-dom';
import ThemeMenu from '../components/ThemeMenu';

const privacy = [
  ['Information we collect', 'You can read public posts without an account. If you register, TechBlog stores your email address and account details. It also stores the profile information you provide and your activity, including posts, comments, reactions, follows, and bookmarks.'],
  ['How we use information', 'TechBlog uses this information to operate your account, display content, remember your preferences, prevent abuse, and send account emails such as verification and password reset messages. Posts, comments, and public profile details can be seen by other visitors.'],
  ['Sign-in providers', 'If you choose a supported external sign-in provider, TechBlog uses the account identifier, email, and basic profile details supplied by that provider to create or sign in to your account. If Google sign-in is enabled, TechBlog requests only basic identity information and uses it for account access. It does not request access to Gmail, Drive, or Calendar.'],
  ['Service providers and browser storage', 'Cloudflare hosts TechBlog, and Resend delivers account email. If you use an AI writing or summarization feature, the text needed for that request may be sent to the configured AI provider. TechBlog uses browser storage to keep you signed in and remember settings such as your theme.'],
  ['Your choices', 'You can update your profile and remove your own posts or comments through TechBlog. Use the contact below to ask about accessing, correcting, or deleting your account information.']
];

const terms = [
  ['Using TechBlog', 'TechBlog lets you read and publish articles and participate in discussions. Keep your account credentials secure and use the service lawfully. Do not post spam, harass other users, distribute malicious material, or publish personal information without permission.'],
  ['Your content', 'You retain ownership of your posts and comments. By publishing them, you allow TechBlog to store and display them as needed to operate the service. Only publish material you have the right to share.'],
  ['Moderation', 'TechBlog may remove content or restrict accounts that violate these terms or interfere with the service.'],
  ['Editorial and AI content', 'Articles and AI-generated drafts or summaries can contain errors. Check original sources and use your own judgment before relying on what you read.'],
  ['Changes', 'We may update these terms as TechBlog changes. The current terms will be available on this page.']
];

export default function LegalPage({ isPrivacy = false }) {
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  return (
    <div className="min-h-screen bg-[var(--theme-panel)]">
      <header className="border-b border-[var(--theme-line)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-spectral text-2xl font-bold">TechBlog</Link>
          <ThemeMenu />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-12 sm:py-16">
        <h1 className="font-spectral text-4xl font-bold sm:text-5xl">{title}</h1>
        {(isPrivacy ? privacy : terms).map(([heading, content]) => (
          <section key={heading}>
            <h2 className="font-spectral text-2xl font-bold">{heading}</h2>
            <p className="mt-2 leading-relaxed text-[var(--theme-muted)]">{content}</p>
          </section>
        ))}
        <section>
          <h2 className="font-spectral text-2xl font-bold">Contact</h2>
          <p className="mt-2 leading-relaxed text-[var(--theme-muted)]">
            For questions about TechBlog, email <a className="underline" href="mailto:sredeepak010@gmail.com">sredeepak010@gmail.com</a>.
          </p>
        </section>
        <Link className="inline-block underline" to={isPrivacy ? '/terms' : '/privacy'}>{isPrivacy ? 'Terms of Service' : 'Privacy Policy'}</Link>
      </main>
    </div>
  );
}
