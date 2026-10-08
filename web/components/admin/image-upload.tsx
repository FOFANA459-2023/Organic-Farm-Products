"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const { url } = await adminFetch<{ url: string }>("/uploads", { method: "POST", body });
  return url;
}

export function ImageListInput({ value, onChange, max = 12 }: { value: string[]; onChange: (urls: string[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, max - value.length)) urls.push(await upload(f));
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-sprout-light">
            <Image src={url} alt="" fill sizes="160px" className="object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-white">Main</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 p-1.5 text-xs text-white">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 disabled:opacity-30" aria-label="Move left">←</button>
              <button type="button" onClick={() => onChange(value.filter((u) => u !== url))} className="px-1.5">Remove</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="px-1.5 disabled:opacity-30" aria-label="Move right">→</button>
            </div>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-line bg-white text-sm font-medium text-muted hover:border-leaf hover:text-leaf"
          >
            {busy ? "Uploading…" : "+ Add photos"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <p className="mt-2 text-xs text-muted">JPG, PNG or WebP, up to 5 MB each. The first photo is the main one.</p>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function SingleImageInput({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  return <ImageListInput value={value ? [value] : []} onChange={(urls) => onChange(urls[0] ?? null)} max={1} />;
}
