import { SkillsExplorer } from "@/components/SkillsExplorer";
import { SKILLS } from "@/lib/skills-data";

export const metadata = { title: "Skills — INSEPTI" };

export default function SkillsPage() {
  return <div className="skills-v4"><header><h1>Skills opérationnels</h1><p>Explorez des compétences agentiques réelles, filtrez-les, consultez leurs capacités et récupérez leur commande d’installation.</p></header><SkillsExplorer skills={SKILLS}/></div>;
}
