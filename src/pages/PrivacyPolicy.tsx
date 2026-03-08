import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Starfield from "@/components/landing/Starfield";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Starfield />
      <Header />
      <main className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-3xl [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-purple [&_a:hover]:underline">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-1">Vex.ai</p>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: March 8, 2026</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">1. Introduction</h2>
          <p>Welcome to Vex.ai ("Vex", "we", "our", or "us").</p>
          <p>Vex.ai is an AI-powered platform designed to help users validate ideas, generate execution strategies, simulate boardroom-style decision-making, and assist with building and launching projects or startups.</p>
          <p>This Privacy Policy explains how we collect, use, store, and protect your information when you access or use our website, applications, and services (collectively referred to as the "Service").</p>
          <p>By using Vex.ai, you agree to the collection and use of information in accordance with this policy.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">2. Information We Collect</h2>
          <p>We collect several types of information in order to operate and improve the Service.</p>

          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.1 Information You Provide</h3>
          <p>When you create an account or interact with Vex.ai, you may provide:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Account credentials</li>
            <li>Startup or project descriptions</li>
            <li>Ideas, prompts, or questions submitted to the AI system</li>
            <li>Messages or feedback sent to our support team</li>
            <li>Any files or content uploaded to the platform</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.2 AI Interaction Data</h3>
          <p>When you interact with the AI features of Vex.ai, the system processes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Prompts you submit</li>
            <li>Ideas or concepts you describe</li>
            <li>Follow-up questions</li>
            <li>Generated responses</li>
          </ul>
          <p>These interactions may be stored to provide continuity of the service and improve the quality of AI-generated outputs.</p>

          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2.3 Automatically Collected Information</h3>
          <p>When you access the platform, certain technical information may be collected automatically, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Pages visited</li>
            <li>Time spent on pages</li>
            <li>Usage patterns</li>
            <li>Error logs and diagnostic data</li>
          </ul>
          <p>This information helps us maintain platform reliability and improve user experience.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">3. How We Use Your Information</h2>
          <p>We use collected information for several purposes, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Providing and maintaining the Vex.ai platform</li>
            <li>Generating AI outputs and boardroom simulations</li>
            <li>Personalizing user experiences</li>
            <li>Improving product functionality and AI systems</li>
            <li>Analyzing platform usage and performance</li>
            <li>Detecting fraud, abuse, or security issues</li>
            <li>Communicating updates, product changes, or support messages</li>
          </ul>
          <p className="font-semibold text-foreground">We do not sell your personal information.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">4. AI Systems and Data Processing</h2>
          <p>Vex.ai uses artificial intelligence systems to generate responses, analyses, and recommendations based on user input.</p>
          <p>User prompts and interactions may be processed by AI models or supporting infrastructure to generate outputs.</p>
          <p>Some anonymized or aggregated interaction data may be used internally to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Improve system performance</li>
            <li>Refine response quality</li>
            <li>Train or evaluate internal algorithms</li>
          </ul>
          <p>However, we do not use your personal data to publicly publish or resell your ideas.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">5. Data Sharing and Third-Party Services</h2>
          <p>We may share limited information with trusted third-party service providers that help operate our platform. These may include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cloud hosting providers</li>
            <li>AI model infrastructure providers</li>
            <li>Analytics services</li>
            <li>Security and monitoring services</li>
          </ul>
          <p>These third parties process data only as necessary to provide services on our behalf and are expected to protect user data appropriately.</p>
          <p className="font-semibold text-foreground">We do not sell or rent personal information to third parties.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">6. Data Security</h2>
          <p>We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, misuse, or disclosure.</p>
          <p>However, no internet-based service can guarantee absolute security. Users should avoid submitting highly sensitive personal or confidential information through the platform.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">7. Data Retention</h2>
          <p>We retain personal information only as long as necessary to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide the Vex.ai service</li>
            <li>Maintain account functionality</li>
            <li>Improve system performance</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>Users may request deletion of their accounts and associated data at any time.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">8. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal data, including the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the information we hold about you</li>
            <li>Request corrections to inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for certain processing activities</li>
          </ul>
          <p>To submit a request, contact us at: <a href="mailto:rshalm20@gmail.com" className="text-purple hover:underline">rshalm20@gmail.com</a></p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">9. Children's Privacy</h2>
          <p>Vex.ai is not intended for use by children under the age of 13.</p>
          <p>We do not knowingly collect personal information from children under 13. If we become aware that such data has been collected, we will delete it promptly.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">10. International Users</h2>
          <p>If you access Vex.ai from outside the country where our servers are located, your information may be transferred to and processed in other jurisdictions.</p>
          <p>By using the Service, you consent to such transfers.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">11. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy periodically.</p>
          <p>If significant changes are made, the "Last Updated" date at the top of this document will be revised.</p>
          <p>Continued use of the Service after changes indicates acceptance of the updated policy.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">12. Contact Information</h2>
          <p>If you have questions about this Privacy Policy or how your information is handled, you may contact us at:</p>
          <p>Email: <a href="mailto:rshalm20@gmail.com" className="text-purple hover:underline">rshalm20@gmail.com</a></p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
