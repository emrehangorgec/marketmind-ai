import { Disclaimer } from "@/components/common/Disclaimer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#05060b] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p>Last updated: November 2025</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using MarketMind AI, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Disclaimer of Warranties</h2>
          <Disclaimer />
          <p>
            The service is provided "as is" without warranties of any kind, either express or implied.
          </p>

          <h2>3. Limitation of Liability</h2>
          <p>
            In no event shall MarketMind AI be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            You agree to use the platform only for lawful purposes. You are prohibited from posting on or transmitting through the Site any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit, profane, hateful, racially, ethnically, or otherwise objectionable.
          </p>
        </div>
      </div>
    </main>
  );
}
