"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { PromptCard } from "@/lib/prompts";
import { AiTag, DifficultyTag, SpecialtyTag } from "./PromptTags";

function PromptMeta({ prompt }: { prompt: PromptCard }) {
  return (
    <div className="prompt-card-meta">
      <span><Image src="/icons/specialties/aime-gris.png" alt="J’aime" width={16} height={16} unoptimized />{prompt.likes}</span>
      <span><Image src="/icons/specialties/date-gris.png" alt="Mise à jour" width={16} height={16} unoptimized />{new Date(prompt.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</span>
    </div>
  );
}

export function PromptCardView({ prompt }: { prompt: PromptCard }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();

  function openPreview() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPreviewOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPreviewOpen(false), 160);
  }

  return (
    <>
      <article
        className="prompt-card focus-within:ring-2 focus-within:ring-insepti-green"
        onMouseEnter={openPreview}
        onMouseLeave={scheduleClose}
      >
        <div className="prompt-card-tags">
          <SpecialtyTag value={prompt.specialty} />
          <DifficultyTag value={prompt.difficulty} />
          <AiTag value={prompt.ai} />
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
              <SpecialtyTag value={prompt.specialty} />
              <DifficultyTag value={prompt.difficulty} />
              <AiTag value={prompt.ai} />
            </div>
            <p className="brand-kicker mt-7">Aperçu du prompt</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.035em]">{prompt.title}</h2>
            <p className="mt-4 text-[15px] leading-7 text-insepti-slate">{prompt.description}</p>
            <div className="prompt-preview-body">
              Transforme votre besoin en un résultat structuré, précis et immédiatement exploitable. Les champs de personnalisation apparaîtront dans la fiche complète.
            </div>
            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-insepti-slate">Cas d’usage</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                <span className="use-case">Préparer un livrable professionnel</span>
                <span className="use-case">Accélérer une tâche récurrente</span>
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between gap-4">
              <PromptMeta prompt={prompt} />
              <Link href={`/prompt/${prompt.slug}`} className="primary-action pointer-events-auto" tabIndex={0}>Découvrir le prompt <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
