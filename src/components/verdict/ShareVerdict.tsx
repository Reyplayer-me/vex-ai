import { useState } from "react";
import { Download, Link2, Loader2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { downloadCanvas, renderPreviewImage, renderStoryCard } from "@/lib/share-card";
import { shareIdea, shareUrl, unshareIdea, VexApiError } from "@/lib/vex-api";
import { track } from "@/lib/analytics";
import type { QuickVerdict } from "@/types/verdict";

interface Props {
  ideaId: string;
  idea: string;
  result: QuickVerdict;
  claimToken: string | null;
  shareId: string | null;
  onShareChange: (shareId: string | null) => void;
}

export const ShareVerdict = ({ ideaId, idea, result, claimToken, shareId, onShareChange }: Props) => {
  const [busy, setBusy] = useState<"download" | "link" | "unshare" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const download = async () => {
    setBusy("download");
    setMessage(null);
    try {
      const canvas = await renderStoryCard(idea, result);
      const filename = `vex-verdict-${result.verdict.toLowerCase()}.png`;
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      const file = blob ? new File([blob], filename, { type: "image/png" }) : null;
      // On phones the share sheet is the easiest way to save to Photos or post.
      if (file && navigator.canShare?.({ files: [file] }) && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        try {
          await navigator.share({ files: [file] });
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          await downloadCanvas(canvas, filename);
        }
      } else {
        await downloadCanvas(canvas, filename);
      }
      track("share_card_downloaded");
    } catch {
      setMessage("We couldn't create the image. Try again, or take a screenshot of your verdict.");
    } finally {
      setBusy(null);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied.");
      setFallbackUrl(null);
    } catch {
      setFallbackUrl(url);
      setMessage("Copy didn't work in this browser. Press and hold the link below to copy it.");
    }
    track("share_link_copied");
  };

  const createLink = async () => {
    setConfirmOpen(false);
    setBusy("link");
    setMessage(null);
    try {
      let image: string | undefined;
      try {
        image = (await renderPreviewImage(idea, result)).toDataURL("image/png");
      } catch {
        image = undefined;
      }
      const { shareId: id } = await shareIdea(ideaId, claimToken, image);
      onShareChange(id);
      await copy(shareUrl(id));
    } catch (err) {
      setMessage(err instanceof VexApiError ? err.message : "We couldn't create the link. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const stopSharing = async () => {
    setBusy("unshare");
    try {
      await unshareIdea(ideaId, claimToken);
      onShareChange(null);
      setFallbackUrl(null);
      setMessage("The public link is off.");
    } catch {
      setMessage("We couldn't turn the link off. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card/60 p-5" aria-labelledby="share-heading">
      <h2 id="share-heading" className="mb-1 font-sans text-lg font-semibold text-foreground">
        Share your verdict
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The card shows your verdict, score, one-liner and the first 80 characters of your idea. Nothing else.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="cta" size="lg" onClick={download} disabled={!!busy} className="font-semibold">
          {busy === "download" ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
          Download image
        </Button>
        <Button variant="outline" size="lg" onClick={() => (shareId ? copy(shareUrl(shareId)) : setConfirmOpen(true))} disabled={!!busy}>
          {busy === "link" ? <Loader2 className="animate-spin" aria-hidden /> : <Link2 aria-hidden />}
          Copy link
        </Button>
      </div>
      {shareId && (
        <Button variant="ghost" size="sm" className="mt-2 h-11 text-muted-foreground" onClick={stopSharing} disabled={!!busy}>
          <EyeOff aria-hidden /> Stop sharing
        </Button>
      )}
      {message && (
        <p className="mt-3 text-sm text-foreground" role="status">
          {message}
        </p>
      )}
      {fallbackUrl && <Input readOnly value={fallbackUrl} className="mt-2 h-11" onFocus={(e) => e.currentTarget.select()} />}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make a public link?</AlertDialogTitle>
            <AlertDialogDescription>
              Anyone with the link will see your verdict, score, one-liner and a shortened version of your idea. The full report stays private. You can turn the link off at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-11" onClick={createLink}>
              Create link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
