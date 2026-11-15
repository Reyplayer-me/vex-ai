import { useState } from "react";
import { DollarSign, GraduationCap, TrendingUp, Zap, Swords } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { advisorByName } from "@/lib/advisors";
import { VerdictStamp } from "./VerdictResult";
import type { FocusKey, FullReport } from "@/types/verdict";
import { cn } from "@/lib/utils";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-border bg-card/60 p-5">
    <h3 className="mb-3 font-sans text-base font-semibold text-foreground">{title}</h3>
    {children}
  </section>
);

const List = ({ items, className }: { items: string[]; className?: string }) => (
  <ul className={cn("list-disc space-y-1.5 pl-5 text-sm text-foreground", className)}>
    {items.map((x, i) => (
      <li key={i}>{x}</li>
    ))}
  </ul>
);

const FOCUS: { key: FocusKey; label: string; icon: typeof Zap }[] = [
  { key: "speed", label: "Speed", icon: Zap },
  { key: "cost", label: "Cost", icon: DollarSign },
  { key: "learning", label: "Learning", icon: GraduationCap },
  { key: "scale", label: "Scale", icon: TrendingUp },
];

const PHASES = [
  { key: "foundations", label: "Foundations" },
  { key: "mvp", label: "MVP" },
  { key: "launch", label: "Launch" },
  { key: "iterate", label: "Iterate" },
] as const;

const Debate = ({ debate }: { debate: FullReport["debate"] }) => (
  <div className="space-y-4">
    {debate.advisors.map((a) => {
      const meta = advisorByName(a.role);
      return (
        <section key={a.role} className={cn("rounded-xl border bg-card/60 p-5", meta.border)}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className={cn("flex items-center gap-2 font-sans text-base font-semibold", meta.color)}>
              <meta.icon className="h-4 w-4" aria-hidden />
              {a.role}
            </h3>
            <VerdictStamp verdict={a.stance} size="sm" />
          </div>
          <p className="text-sm leading-relaxed text-foreground">{a.view}</p>
          {a.biggest_concern && (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Biggest concern:</span> {a.biggest_concern}
            </p>
          )}
        </section>
      );
    })}

    {debate.disagreements.length > 0 && (
      <Section title="Where they disagree">
        <ul className="space-y-3">
          {debate.disagreements.map((d, i) => (
            <li key={i} className="text-sm">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Swords className="h-4 w-4 text-purple" aria-hidden />
                {d.between.join(" vs ")}: {d.topic}
              </p>
              <p className="mt-1 text-muted-foreground">{d.summary}</p>
            </li>
          ))}
        </ul>
      </Section>
    )}

    <section className="rounded-xl border border-purple/50 bg-purple/10 p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-sans text-base font-semibold text-foreground">The board's decision</h3>
        <VerdictStamp verdict={debate.board_decision.verdict} size="sm" />
      </div>
      <p className="text-sm leading-relaxed text-foreground">{debate.board_decision.reasoning}</p>
      {debate.board_decision.conditions.length > 0 && (
        <>
          <p className="mb-1 mt-3 text-sm font-semibold text-foreground">This holds if:</p>
          <List items={debate.board_decision.conditions} />
        </>
      )}
    </section>
  </div>
);

const Roadmap = ({ roadmap }: { roadmap: FullReport["roadmap"] }) => {
  const [focus, setFocus] = useState<FocusKey>("speed");
  const f = roadmap.focus[focus];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Roadmap focus">
        {FOCUS.map((o) => (
          <Button
            key={o.key}
            type="button"
            variant="outline"
            aria-pressed={focus === o.key}
            onClick={() => setFocus(o.key)}
            className={cn("h-12 flex-col gap-0.5 px-1 text-xs sm:flex-row sm:text-sm", focus === o.key && "border-purple bg-purple text-accent-foreground hover:bg-purple/90")}
          >
            <o.icon aria-hidden />
            {o.label}
          </Button>
        ))}
      </div>
      <Section title={`If you optimise for ${focus}`}>
        <p className="mb-2 text-sm text-foreground">{f.headline}</p>
        <List items={f.changes} />
      </Section>
      <ol className="space-y-4">
        {PHASES.map((p, i) => {
          const phase = roadmap.phases[p.key];
          return (
            <li key={p.key} className="rounded-xl border border-border bg-card/60 p-5">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-sans text-base font-semibold text-foreground">
                  {i + 1}. {p.label}
                </h3>
                {phase.duration && <span className="text-xs text-muted-foreground">{phase.duration}</span>}
              </div>
              <p className="mb-2 text-sm text-muted-foreground">{phase.goal}</p>
              <List items={phase.tasks} />
              {phase.done_when && (
                <p className="mt-3 text-sm text-foreground">
                  <span className="font-semibold">Done when:</span> {phase.done_when}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const Build = ({ plan }: { plan: FullReport["build_plan"] }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Written for a {plan.founder_type} founder.</p>
    <Section title="Stack">
      <ul className="space-y-3">
        {plan.tech_stack.map((t, i) => (
          <li key={i} className="text-sm">
            <p className="text-foreground">
              <span className="font-semibold">{t.layer}:</span> {t.choice}
            </p>
            <p className="text-muted-foreground">{t.why}</p>
          </li>
        ))}
      </ul>
    </Section>
    <Section title="Feature priority">
      <p className="mb-1 text-sm font-semibold text-verdict-proceed">Must have</p>
      <List items={plan.feature_priority.must_have} className="mb-3" />
      <p className="mb-1 text-sm font-semibold text-verdict-pivot">Later</p>
      <List items={plan.feature_priority.later} className="mb-3" />
      <p className="mb-1 text-sm font-semibold text-verdict-kill">Cut for now</p>
      <List items={plan.feature_priority.cut} />
    </Section>
    <Section title="First Weekend Plan">
      <p className="mb-3 text-sm text-foreground">{plan.first_weekend.goal}</p>
      <p className="mb-1 text-sm font-semibold text-foreground">Saturday</p>
      <List items={plan.first_weekend.saturday} className="mb-3" />
      <p className="mb-1 text-sm font-semibold text-foreground">Sunday</p>
      <List items={plan.first_weekend.sunday} />
    </Section>
  </div>
);

const Launch = ({ plan }: { plan: FullReport["launch_plan"] }) => (
  <div className="space-y-4">
    <Section title="Your first user">
      <p className="text-sm text-foreground">{plan.first_user_persona.who}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Their pain:</span> {plan.first_user_persona.pain}
      </p>
      <p className="mb-1 mt-3 text-sm font-semibold text-foreground">Where to find them</p>
      <List items={plan.first_user_persona.where_to_find_them} />
    </Section>
    <Section title={`Start with: ${plan.growth_channel.channel}`}>
      <p className="mb-3 text-sm text-muted-foreground">{plan.growth_channel.why}</p>
      <List items={plan.growth_channel.first_steps} />
    </Section>
    <Section title="Targets to aim for">
      <p className="text-sm text-foreground">
        <span className="font-semibold">Week 1:</span> {plan.week_1_target}
      </p>
      <p className="mt-2 text-sm text-foreground">
        <span className="font-semibold">Month 1:</span> {plan.month_1_target}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Watch:</span> {plan.metric_to_watch}
      </p>
    </Section>
  </div>
);

export const FullReportView = ({ report }: { report: FullReport }) => (
  <Tabs defaultValue="debate" className="w-full">
    <TabsList className="sticky top-[68px] z-20 grid h-12 w-full grid-cols-4 bg-card/95 backdrop-blur">
      <TabsTrigger value="debate" className="h-10">Debate</TabsTrigger>
      <TabsTrigger value="roadmap" className="h-10">Roadmap</TabsTrigger>
      <TabsTrigger value="build" className="h-10">Build</TabsTrigger>
      <TabsTrigger value="launch" className="h-10">Launch</TabsTrigger>
    </TabsList>
    <TabsContent value="debate" className="mt-4">
      <Debate debate={report.debate} />
    </TabsContent>
    <TabsContent value="roadmap" className="mt-4">
      <Roadmap roadmap={report.roadmap} />
    </TabsContent>
    <TabsContent value="build" className="mt-4">
      <Build plan={report.build_plan} />
    </TabsContent>
    <TabsContent value="launch" className="mt-4">
      <Launch plan={report.launch_plan} />
    </TabsContent>
  </Tabs>
);
