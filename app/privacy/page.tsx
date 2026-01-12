export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#05060b] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p>Last updated: November 2025</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.
            We may use Google Authentication for sign-in, which provides us with your email address and name.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, such as to:
          </p>
          <ul>
            <li>Verify your identity</li>
            <li>Save your analysis history</li>
            <li>Send you technical notices and support messages</li>
          </ul>

          <h2>3. Data Storage</h2>
          <p>
            Your API keys (e.g., OpenAI API Key) are stored locally in your browser&apos;s LocalStorage and are never sent to our servers.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We may use third-party services such as OpenAI for generating analysis. Please refer to their privacy policies for information on how they handle data.
          </p>
        </div>
      </div>
    </main>
  );
}
