import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/require-session";
import { getPromptBySlug } from "@/lib/prompts";
import { PromptPersonalizer } from "@/components/PromptPersonalizer";
import { DifficultyTag, OriginTag, SpecialtyTag } from "@/components/PromptTags";
import { PromptFeedback } from "@/components/PromptFeedback";
import { APP_BORDER_CLASS } from "@/lib/app-style";
import { APPLICATION_LAUNCH_URL } from "@/lib/applications-data";
import { getFolderIdsForPrompt, listPromptFolders } from "@/lib/prompt-folders";
import { FolderPicker } from "@/components/FolderPicker";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return { title: `${(await params).slug} — INSEPTI` }; }
export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireSession();
  const prompt = await getPromptBySlug((await params).slug, session.userId, session.role === "admin");
  if (!prompt) notFound();
  const [folders, folderIds] = await Promise.all([listPromptFolders(session.userId), getFolderIdsForPrompt(session.userId, prompt.id)]);
  return <article className="prompt-detail-page">
    <Link href="/catalogue" className="back-link">← Retour aux prompts</Link>
    <header className="prompt-detail-header"><div className="prompt-detail-copy"><div className="prompt-card-tags justify-start"><DifficultyTag value={prompt.difficulty}/><SpecialtyTag value={prompt.specialty}/><OriginTag sourceType={prompt.sourceType}/></div><h1>{prompt.title}</h1><p>{prompt.description}</p><div className="prompt-card-meta"><span><Image src="/icons/specialties/aime-gris.png" alt="J’aime" width={20} height={20} unoptimized/>{prompt.likes}</span><span><Image src="/icons/specialties/date-gris.png" alt="Mise à jour" width={20} height={20} unoptimized/>{new Date(prompt.updatedAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}</span></div></div><aside><p>Enregistrer ce prompt dans votre espace pour le retrouver facilement.</p><FolderPicker promptId={prompt.id} folders={folders.map((folder)=>({id:folder.id,name:folder.name}))} initialFolderIds={folderIds}/></aside></header>
    <PromptPersonalizer body={prompt.body} variables={prompt.variables} applicationName={prompt.applicationName} applicationColorClass={APP_BORDER_CLASS[prompt.applicationSlug] ?? ""} launchUrl={APPLICATION_LAUNCH_URL[prompt.applicationSlug] ?? "https://www.office.com"}/>
    <section className="prompt-use-cases"><div className="section-heading"><div><p className="brand-kicker">Applications concrètes</p><h2>Cas d’usage</h2></div></div><div><article><span>01</span><h3>Préparer un livrable</h3><p>Obtenir une première version structurée à relire et enrichir.</p></article><article><span>02</span><h3>Gagner du temps</h3><p>Standardiser une tâche récurrente sans perdre les critères de qualité.</p></article><article><span>03</span><h3>Faciliter la décision</h3><p>Rendre les informations essentielles plus claires et actionnables.</p></article></div></section>
    <PromptFeedback/>
  </article>;
}
