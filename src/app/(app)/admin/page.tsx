import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin";
import { SKILLS } from "@/lib/skills-data";
import { AdminMotionControl } from "@/components/AdminMotionControl";

const STATUS_LABELS: Record<string, string> = { draft: "À valider", published: "Publié", archived: "Archivé" };

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboardData();
  const { totals, health } = dashboard;
  const priorities = [
    { label: `${totals.drafts} prompt${totals.drafts > 1 ? "s" : ""} en attente de validation`, href: "/admin/prompts" },
    { label: `${totals.openReports} signalement${totals.openReports > 1 ? "s" : ""} à examiner`, href: "/admin/gouvernance" },
    { label: `${totals.activeUsers} utilisateur${totals.activeUsers > 1 ? "s" : ""} actif${totals.activeUsers > 1 ? "s" : ""}`, href: "/admin/utilisateurs" },
  ];
  return <div className="admin-v4"><header><div><h1>Vue d’ensemble</h1><p>Données en direct de la bibliothèque, des utilisateurs et des signalements.</p></div><div className="admin-header-actions"><AdminMotionControl/><Link href="/admin/utilisateurs" className="secondary-action">Gérer les utilisateurs</Link></div></header>
    <section className="admin-v4-kpis">{[["Total prompts",totals.prompts],["J’aime",totals.likes],["Signalements",totals.reports],["Utilisateurs actifs",totals.activeUsers],["Skills publiés",SKILLS.length],["Qualité moyenne",`${health.qualityScore} %`]].map(([label,value])=><article key={label}><span>{label}</span><b>{value}</b></article>)}</section>
    <nav>{([["Prompts","/admin/prompts"],["Utilisateurs","/admin/utilisateurs"],["Gouvernance","/admin/gouvernance"],["Skills","/skills"],["Journal","/admin/journal"]] as const).map(([label,href],index)=><Link className={index===0?"active":""} href={href} key={label}>{label}</Link>)}</nav>
    <div className="admin-v4-grid"><main><header><h2>Dernières mises à jour</h2><Link href="/admin/prompts" className="secondary-action">Voir les {totals.prompts}</Link></header>{dashboard.recentPrompts.map((prompt)=><article key={prompt.id}><b>{prompt.title}</b><span>{prompt.applicationName}</span><span>{STATUS_LABELS[prompt.status] ?? prompt.status}</span><span>{new Date(prompt.updatedAt).toLocaleDateString("fr-FR")}</span><Link href="/admin/prompts" className="secondary-action">Examiner</Link></article>)}</main>
      <aside><section><h2>Santé de la bibliothèque</h2><strong>{health.qualityScore} / 100</strong>{[["Prompts publiés",health.publicationRate],["Prompts traités",health.reviewRate],["Métadonnées",health.metadataRate]].map(([label,value])=><div key={label}><p><b>{label}</b><span>{value} %</span></p><i><em style={{width:`${value}%`}}/></i></div>)}</section><section><h2>Actions prioritaires</h2>{priorities.map((item)=><Link key={item.label} href={item.href}>→ {item.label}</Link>)}<Link href="/admin/gouvernance" className="primary-action">Ouvrir le centre de contrôle</Link></section></aside>
    </div>
  </div>;
}
