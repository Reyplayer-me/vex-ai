import type { QuickVerdict, Verdict } from "@/types/verdict";

export const VERDICT_COLORS: Record<Verdict, string> = {
  PROCEED: "#C2F261",
  PIVOT: "#F7B955",
  KILL: "#FF5C64",
};

const SITE = "vex-ai.lovable.app";

export const shortenIdea = (idea: string, max = 80) => {
  const flat = idea.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, "")}…`;
  }
  return lines;
}

function background(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#09090D";
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.6);
  glow.addColorStop(0, "rgba(140, 82, 230, 0.45)");
  glow.addColorStop(1, "rgba(9, 9, 13, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function stamp(ctx: CanvasRenderingContext2D, verdict: Verdict, cx: number, cy: number, size: number) {
  const color = VERDICT_COLORS[verdict];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.08);
  ctx.font = `900 ${size}px Orbitron, sans-serif`;
  const width = ctx.measureText(verdict).width;
  const padX = size * 0.35;
  const padY = size * 0.28;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.07;
  ctx.strokeRect(-width / 2 - padX, -size / 2 - padY, width + padX * 2, size + padY * 2);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(verdict, 0, size * 0.04);
  ctx.restore();
}

async function ensureFonts() {
  try {
    await Promise.all([document.fonts.load("900 80px Orbitron"), document.fonts.load("700 40px Orbitron")]);
  } catch {
    /* fall back to system sans */
  }
}

/** 1080x1920 vertical card for TikTok / Stories. */
export async function renderStoryCard(idea: string, r: QuickVerdict) {
  await ensureFonts();
  const w = 1080;
  const h = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  background(ctx, w, h);
  ctx.textAlign = "center";

  ctx.fillStyle = "#B9A6E8";
  ctx.font = "600 38px Orbitron, sans-serif";
  ctx.fillText("THE BOARD'S VERDICT ON", w / 2, 250);

  ctx.fillStyle = "#F2F2F2";
  ctx.font = "500 54px system-ui, -apple-system, sans-serif";
  wrap(ctx, `“${shortenIdea(idea)}”`, w - 180, 3).forEach((line, i) => ctx.fillText(line, w / 2, 350 + i * 72));

  stamp(ctx, r.verdict, w / 2, 820, 170);

  // Centre "5.4/10" as one unit.
  const score = r.overall_score.toFixed(1);
  ctx.font = "800 190px Orbitron, sans-serif";
  const scoreWidth = ctx.measureText(score).width;
  ctx.font = "600 70px Orbitron, sans-serif";
  const outOfWidth = ctx.measureText("/10").width;
  const left = (w - scoreWidth - outOfWidth - 12) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 190px Orbitron, sans-serif";
  ctx.fillText(score, left, 1240);
  ctx.fillStyle = "#9A9AA8";
  ctx.font = "600 70px Orbitron, sans-serif";
  ctx.fillText("/10", left + scoreWidth + 12, 1240);
  ctx.textAlign = "center";

  ctx.fillStyle = "#E8E8EE";
  ctx.font = "italic 500 52px system-ui, -apple-system, sans-serif";
  wrap(ctx, r.one_liner, w - 200, 4).forEach((line, i) => ctx.fillText(line, w / 2, 1420 + i * 70));

  ctx.fillStyle = "#C2F261";
  ctx.font = "800 64px Orbitron, sans-serif";
  ctx.fillText("VEX", w / 2, 1760);
  ctx.fillStyle = "#B9A6E8";
  ctx.font = "500 36px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Test your idea free at ${SITE}`, w / 2, 1830);
  return canvas;
}

/** 1200x630 link-preview image. */
export async function renderPreviewImage(idea: string, r: QuickVerdict) {
  await ensureFonts();
  const w = 1200;
  const h = 630;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  background(ctx, w, h);

  ctx.textAlign = "left";
  ctx.fillStyle = "#C2F261";
  ctx.font = "800 44px Orbitron, sans-serif";
  ctx.fillText("VEX", 70, 100);
  ctx.fillStyle = "#F2F2F2";
  ctx.font = "500 40px system-ui, -apple-system, sans-serif";
  wrap(ctx, `“${shortenIdea(idea)}”`, 620, 3).forEach((line, i) => ctx.fillText(line, 70, 200 + i * 54));
  ctx.fillStyle = "#D8D8E0";
  ctx.font = "italic 400 32px system-ui, -apple-system, sans-serif";
  wrap(ctx, r.one_liner, 620, 3).forEach((line, i) => ctx.fillText(line, 70, 410 + i * 44));
  ctx.fillStyle = "#B9A6E8";
  ctx.font = "500 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(SITE, 70, 580);

  stamp(ctx, r.verdict, 950, 230, 72);
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 120px Orbitron, sans-serif";
  ctx.fillText(r.overall_score.toFixed(1), 950, 470);
  ctx.fillStyle = "#9A9AA8";
  ctx.font = "600 40px Orbitron, sans-serif";
  ctx.fillText("out of 10", 950, 530);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("no image"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, "image/png");
  });
}
