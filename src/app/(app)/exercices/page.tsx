import { DifficultyTag } from "@/components/PromptTags";

const EXERCISES = [
  ["Débutant", "Clarifier une demande floue", "Reformulez un besoin imprécis en objectif, contexte et livrable attendu.", "8 min"],
  ["Intermédiaire", "Comparer deux réponses d’IA", "Évaluez leur fiabilité, leur précision et leur utilité avec une grille commune.", "12 min"],
  ["Avancé", "Sécuriser un cas client complexe", "Identifiez les données sensibles et concevez un prompt exploitable sans les exposer.", "18 min"],
] as const;
export const metadata = { title: "Exercices — INSEPTI" };
export default function ExercisesPage() { return <div><header className="feature-heading"><p className="brand-kicker">Mise en pratique</p><h1>Entraînez-vous sur des cas professionnels</h1><p>Des exercices courts, progressifs et directement liés à vos usages quotidiens.</p></header><div className="exercise-grid">{EXERCISES.map(([level,title,description,time],index)=><article key={title}><div><span className="exercise-number">{String(index+1).padStart(2,"0")}</span><DifficultyTag value={level}/></div><h2>{title}</h2><p>{description}</p><footer><span>{time}</span><button className="secondary-action">Commencer →</button></footer></article>)}</div></div>; }
