import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const LegalPage = ({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="px-4 pb-16 pt-24 sm:px-6">
      <article className="mx-auto max-w-2xl text-base leading-relaxed [&_a]:text-purple-glow [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:text-muted-foreground [&_p]:mb-3 [&_p]:text-muted-foreground [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-sm">Last updated: {updated}</p>
        {children}
      </article>
    </main>
    <Footer />
  </div>
);
