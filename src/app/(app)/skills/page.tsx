import Link from "next/link";
const SKILLS=[
  ["Skill Creator","Concevoir et documenter des skills robustes","Anthropic · anthropics/skills","43,8 k"],
  ["Frontend Design","Générer des interfaces cohérentes et accessibles","OpenAI · design-systems","31,2 k"],
  ["Data Analyst","Analyser, valider et restituer des données","Community · analytics-kit","26,9 k"],
  ["PDF Toolkit","Lire, structurer et produire des documents PDF","OpenAI · document-tools","21,5 k"],
  ["Brand Voice","Appliquer une voix de marque dans les livrables","INSEPTI · professional-ai","18,7 k"],
  ["Security Review","Auditer un changement et documenter les risques","Anthropic · secure-agents","15,4 k"],
] as const;
export const metadata={title:"Skills — INSEPTI"};
export default function SkillsPage(){return <div className="skills-v4"><header><h1>Skills vérifiés</h1><p>Des compétences réutilisables, auditées et prêtes à intégrer dans vos workflows.</p></header><div className="skills-v4-toolbar"><label className="search-field"><span>⌕</span><input placeholder="Rechercher un skill, un éditeur ou un dépôt..."/></label><div><button className="is-active">Tous 28</button><button>Officiels</button><button>Audités</button><button>Productivité</button><button>Data</button></div></div><div className="skills-v4-grid"><div className="skills-v4-table"><div className="skills-v4-head"><b>N°</b><b>Skill</b><b>Éditeur / dépôt</b><b>Installations</b><b>Plus</b></div>{SKILLS.map((s,i)=><Link href="/skills/skill-creator" key={s[0]} className="skills-v4-row"><b>{String(i+1).padStart(2,"0")}</b><span><strong>{s[0]}</strong><small>{s[1]}</small></span><span>{s[2]}</span><b>{s[3]}</b><em>Ouvrir</em></Link>)}</div><aside className="skill-feature"><small>À découvrir</small><h2>Skill Creator</h2><p>Une méthode structurée pour concevoir, tester et maintenir des skills fiables pour vos équipes.</p><div><small>INSTALLATION</small><strong>npx skills add anthropics/skills</strong></div><dl><dt>Installations</dt><dd>43,8 k</dd><dt>Dépôt</dt><dd>anthropics/skills</dd><dt>Audit</dt><dd>Conforme</dd></dl><Link href="/skills/skill-creator" className="secondary-action">Voir le détail</Link></aside></div></div>}
