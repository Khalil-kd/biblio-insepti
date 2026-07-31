import Link from "next/link";
import { listAllPromptsForAdmin } from "@/lib/admin";

export const metadata = { title: "Administration — INSEPTI" };
export default async function AdminDashboardPage() {
  const allPrompts = await listAllPromptsForAdmin();
  const official = allPrompts.filter((prompt) => prompt.sourceType === "insepti");
  const values = { published: official.filter((prompt) => prompt.status === "published").length, draft: official.filter((prompt) => prompt.status === "draft").length, archived: official.filter((prompt) => prompt.status === "archived").length };
  return <div className="admin-dashboard">
    <header className="feature-heading"><p className="brand-kicker">Administration</p><h1>Pilotez la bibliothèque</h1><p>Suivez l’état du catalogue et accédez rapidement aux opérations qui demandent votre attention.</p></header>
    <section className="admin-kpis"><article><small>Prompts publiés</small><strong>{values.published}</strong><p>Disponibles pour les collaborateurs</p></article><article><small>À finaliser</small><strong>{values.draft}</strong><p>Brouillons en attente de publication</p></article><article><small>Archivés</small><strong>{values.archived}</strong><p>Conservés hors du catalogue</p></article><article><small>Couverture</small><strong>{official.length ? Math.round(values.published/official.length*100) : 0}%</strong><p>Part du catalogue actuellement publiée</p></article></section>
    <div className="admin-grid"><section className="admin-health"><div className="section-heading"><div><p className="brand-kicker">État du portail</p><h2>Bibliothèque opérationnelle</h2></div><span className="status-dot"><i/>À jour</span></div><div className="health-bars"><p><span>Publication</span><b style={{width:`${official.length ? values.published/official.length*100 : 0}%`}}/></p><p><span>Prompts renseignés</span><b style={{width:"86%"}}/></p><p><span>Qualité éditoriale</span><b style={{width:"72%"}}/></p></div><Link href="/admin/prompts" className="primary-action">Gérer les prompts →</Link></section><nav className="admin-shortcuts"><Link href="/admin/gouvernance"><span>01</span><div><strong>Signalements</strong><p>Traiter les retours sur les prompts</p></div><b>→</b></Link><Link href="/admin/utilisateurs"><span>02</span><div><strong>Utilisateurs</strong><p>Gérer les accès et les rôles</p></div><b>→</b></Link><Link href="/admin/journal"><span>03</span><div><strong>Journal d’activité</strong><p>Contrôler les actions sensibles</p></div><b>→</b></Link><Link href="/admin/sauvegarde"><span>04</span><div><strong>Sauvegarde</strong><p>Exporter ou restaurer les données</p></div><b>→</b></Link></nav></div>
  </div>;
}
