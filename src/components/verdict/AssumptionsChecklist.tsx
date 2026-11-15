import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/vex-api";

interface Assumption {
  id: string;
  text: string;
  done: boolean;
  source: "risk" | "custom";
}

export const AssumptionsChecklist = ({ ideaId, userId }: { ideaId: string; userId: string }) => {
  const [items, setItems] = useState<Assumption[] | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: e } = await db.from("assumptions").select("id, text, done, source").eq("idea_id", ideaId).order("created_at");
    if (e) setError("We couldn't load your checklist. Refresh to try again.");
    else setItems(data);
  }, [ideaId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (item: Assumption) => {
    setItems((list) => list?.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)) ?? null);
    const { error: e } = await db.from("assumptions").update({ done: !item.done }).eq("id", item.id);
    if (e) {
      setError("That change didn't save.");
      load();
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim().slice(0, 300);
    if (!text) return;
    const { data, error: err } = await db
      .from("assumptions")
      .insert({ idea_id: ideaId, user_id: userId, text, source: "custom" })
      .select("id, text, done, source")
      .single();
    if (err) {
      setError("That didn't save. Please try again.");
      return;
    }
    setItems((list) => [...(list ?? []), data]);
    setDraft("");
  };

  const remove = async (id: string) => {
    setItems((list) => list?.filter((x) => x.id !== id) ?? null);
    const { error: e } = await db.from("assumptions").delete().eq("id", id);
    if (e) load();
  };

  const done = items?.filter((x) => x.done).length ?? 0;

  return (
    <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="assumptions-heading">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 id="assumptions-heading" className="font-sans text-lg font-semibold text-foreground">
          Assumptions to test
        </h2>
        {items && items.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {done}/{items.length} tested
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Started from the Risk Analyst's top risks. Tick them off as you test them with real people.</p>

      {items === null && !error && <p className="text-sm text-muted-foreground">Loading...</p>}
      <ul className="space-y-1">
        {items?.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-lg px-1 hover:bg-muted/40">
            <label className="flex min-h-[48px] flex-1 cursor-pointer items-center gap-3 text-sm">
              <Checkbox checked={item.done} onCheckedChange={() => toggle(item)} className="h-5 w-5" />
              <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.text}</span>
            </label>
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-muted-foreground" onClick={() => remove(item.id)} aria-label={`Remove: ${item.text}`}>
              <Trash2 aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} placeholder="Add your own, e.g. 3 people pre-order" className="h-11 text-base" aria-label="New assumption" />
        <Button type="submit" variant="outline" className="h-11 shrink-0" disabled={!draft.trim()}>
          <Plus aria-hidden /> Add
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-verdict-kill">
          {error}
        </p>
      )}
    </section>
  );
};
