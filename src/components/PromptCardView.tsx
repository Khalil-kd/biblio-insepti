"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { PromptCard } from "@/lib/prompts";
import { DifficultyTag, OriginTag, SpecialtyTag } from "./PromptTags";

function PromptMeta({ prompt }: { prompt: PromptCard }) {
  return (
    <div className="prompt-card-meta">
      <span><Image src="/icons/specialties/aime-gris.png" alt="J’aime" width={20} height={20} unoptimized />{prompt.likes}</span>
      <span><Image src="/icons/specialties/date-gris.png" alt="Mise à jour" width={20} height={20} unoptimized />{new Date(prompt.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
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
    openTimer.current = setTimeout(openPreview, 2000);
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
              <span>Tu es un expert éditorial. À partir du contenu fourni, génère une série de publications adaptées à @réseau, @audience et @ton...</span>
              <button type="button">Cliquer pour afficher le prompt complet →</button>
            </div>
            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase text-insepti-slate">Cas d’usage</p>
              <div className="prompt-preview-cases">
                <span className="use-case">Livre blanc → série LinkedIn</span>
                <span className="use-case">Annonce produit → posts multi-réseaux</span>
                <span className="use-case">Rapport → messages clés</span>
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
