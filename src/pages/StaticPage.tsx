import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const StaticPage = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
        <div className="space-y-4 text-muted-foreground">{children}</div>
      </div>
    </main>
    <Footer />
  </div>
);

export default StaticPage;
