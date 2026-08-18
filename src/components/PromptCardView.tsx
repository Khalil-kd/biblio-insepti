"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { PromptCard } from "@/lib/prompts";
import { DifficultyTag, OriginTag, SpecialtyTag } from "./PromptTags";

function PromptMeta({ prompt }: { prompt: PromptCard }) {
  return (
    <div className="prompt-card-meta">
      <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S4 16 4 9.8A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8c0 6.2-8 10.7-8 10.7Z"/></svg>{prompt.likes}</span>
      <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z"/></svg>{new Date(prompt.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
    </div>
  );
}

export function PromptCardView({ prompt }: { prompt: PromptCard }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();

  function openPreview() {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPreviewOpen(true);
  }

  function scheduleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(openPreview, 1200);
  }

  function scheduleClose() {
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;
    if (!previewOpen) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPreviewOpen(false), 160);
  }

  return (
    <>
      <article
        className="prompt-card focus-within:ring-2 focus-within:ring-insepti-green"
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
      >
        <div className="prompt-card-tags">
          <DifficultyTag value={prompt.difficulty} />
          <SpecialtyTag value={prompt.specialty} />
          <OriginTag sourceType={prompt.sourceType} />
        </div>
        <Link href={`/prompt/${prompt.slug}`} prefetch={false} className="focus-ring flex flex-1 flex-col" aria-labelledby={titleId}>
          <h2 id={titleId} className="prompt-card-title">{prompt.title}</h2>
          <p className="prompt-card-description">{prompt.description}</p>
        </Link>
        <PromptMeta prompt={prompt} />
      </article>

      {previewOpen && (
        <div className="prompt-preview-layer">
          <section
            className="prompt-preview"
            onMouseEnter={openPreview}
            onMouseLeave={scheduleClose}
          >
            <button className="prompt-preview-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Fermer l’aperçu">×</button>
            <div className="prompt-card-tags justify-start">
              <DifficultyTag value={prompt.difficulty} />
              <SpecialtyTag value={prompt.specialty} />
              <OriginTag sourceType={prompt.sourceType} />
            </div>
            <h2 className="prompt-preview-title">{prompt.title}</h2>
            <p className="prompt-preview-description">{prompt.description}</p>
            <div className="prompt-preview-body">
              <strong>APERÇU DU PROMPT</strong>
              <span>{prompt.previewBody}</span>
              <button type="button">Cliquer pour afficher le prompt complet →</button>
            </div>
            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase text-insepti-slate">Cas d’usage</p>
              <div className="prompt-preview-cases">
                {prompt.useCases.map((useCase)=><span className="use-case" key={useCase}>{useCase}</span>)}
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between gap-4">
              <PromptMeta prompt={prompt} />
              <Link href={`/prompt/${prompt.slug}`} className="primary-action pointer-events-auto" tabIndex={0}>Découvrir</Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
