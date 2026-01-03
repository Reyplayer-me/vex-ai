import { Zap, BarChart3, FileText, Target, Mail, Calendar, Check, X, Clock, DollarSign, Globe, ArrowUp } from "lucide-react";

const taskItems = [
  { icon: Calendar, label: "Social media post", status: "Cancelled by user", statusIcon: X, statusColor: "text-purple" },
  { icon: FileText, label: "Lead list", status: "70% prepared", statusIcon: Zap, statusColor: "text-purple" },
  { icon: Clock, label: "Payment reminder", status: "sent to selected clients", statusIcon: Check, statusColor: "text-muted-foreground" },
  { icon: DollarSign, label: "Payroll management", status: "Due on 2nd July", statusIcon: Clock, statusColor: "text-muted-foreground" },
];

const ServicesSection = () => {
  return (
    <section id="services" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Meet Core — Your AI Co-Founder.
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Core is the brain behind Vex.ai. It validates your idea, writes your code,
            designs your product, builds your launch assets, and teaches you how to
            scale—all on autopilot.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Strategy Blueprint Card */}
          <div className="rounded-2xl border border-border bg-card/30 p-8">
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Task List Preview */}
              <div className="flex-1 rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-foreground font-medium">All Tasks</span>
                  <span className="text-muted-foreground">Waiting for approval</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">2 days ago</div>
                <div className="space-y-2">
                  {taskItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-foreground">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.status}</div>
                        </div>
                      </div>
                      <item.statusIcon className={`h-4 w-4 ${item.statusColor}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Blueprint Info */}
              <div className="flex-1">
                <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
                  Workflow Blueprint
                </span>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  AI Startup Strategy Blueprint
                </h3>
                <p className="text-muted-foreground mb-4">
                  Harness AI to craft a custom roadmap for startup success,
                  tailored to your unique business goals.
                </p>
                <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2 text-sm text-foreground hover:bg-card transition-colors">
                  Custom Roadmap
                </button>
              </div>
            </div>
          </div>

          {/* AI Chat Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-card/50 to-cyan-950/20 p-8">
            <div className="flex flex-col items-center text-center">
              {/* AI Orb */}
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 via-purple-600/30 to-transparent blur-lg animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-purple-500/30 blur-md" />
              </div>
              
              <h3 className="text-xl font-medium text-foreground mb-2">What can I help with?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Whether you want help in customer handling or make
                changes in your system just give me command
              </p>
              
              <div className="w-full flex items-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-3 mb-4">
                <span className="text-muted-foreground text-sm">Generate</span>
                <div className="ml-auto flex items-center gap-1 text-purple">
                  <ArrowUp className="h-4 w-4" />
                </div>
              </div>

              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                + Add document
              </button>

              <div className="flex items-center gap-2 mt-4">
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">✨ Analyze</span>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">🖼 Generate Image</span>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">🔍 research</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-8 lg:grid-cols-2 mt-8">
          {/* Pitch Enhancement */}
          <div className="rounded-2xl border border-border bg-card/30 p-8">
            <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
              Pitch Enhancement
            </span>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Enhances Investor Pitch
            </h3>
            <p className="text-muted-foreground mb-4">
              Elevate your pitch with data-driven insights and AI tools to
              attract the right investors.
            </p>
            <div className="flex gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Pitch Writer</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Insights</span>
            </div>
          </div>

          {/* Marketing Insights */}
          <div className="rounded-2xl border border-border bg-card/30 p-8">
            <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
              Marketing
            </span>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Market Analysis Insights
            </h3>
            <p className="text-muted-foreground mb-4">
              Utilize AI-powered analytics to understand market trends and
              optimize your business strategy.
            </p>
            <div className="flex gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Leads</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Content</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Social post</span>
            </div>
          </div>
        </div>

        {/* Product Development */}
        <div className="mt-8 rounded-2xl border border-border bg-card/30 p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <span className="inline-block rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground mb-4">
                Sales
              </span>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Product Development Guidance
              </h3>
              <p className="text-muted-foreground mb-4">
                Receive expert advice on product development using AI to refine
                features and enhance user experience.
              </p>
              <div className="flex gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Expert Advice</span>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">Consulting</span>
              </div>
            </div>

            {/* Project Dashboard Preview */}
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="mb-4">
                <div className="text-foreground font-medium">Hey David!</div>
                <div className="text-sm text-muted-foreground">Here is your Custom project & schedule</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">↔</span>
                    <span className="text-sm text-foreground">On going project :</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple" />
                    <div>
                      <div className="text-sm text-foreground">Customer Support Chatbot</div>
                      <div className="text-xs text-muted-foreground">90% Finished</div>
                    </div>
                  </div>
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                </div>

                <div className="p-3 rounded-lg border border-border/50 bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Schedule</span>
                  </div>
                  <div className="flex gap-1 text-xs text-muted-foreground mb-3">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day, i) => (
                      <span key={day} className={`px-2 py-1 rounded ${i === 0 ? "bg-purple text-foreground" : ""}`}>
                        {day}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-border" />
                      <span className="text-foreground">Discovery call</span>
                      <span className="text-muted-foreground ml-auto">10:00 am to 10:30 am</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-purple" />
                      <span className="text-foreground">Custom automation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
