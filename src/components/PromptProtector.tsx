"use client";

import { useMemo, useState } from "react";
import { detectSensitiveData, protectSensitiveData } from "@/lib/sensitive-data";
import { showToast } from "@/lib/toast-client";

const SAMPLE = `Prépare une synthèse pour Marie Dupont.
Contact : marie.dupont@example.com ou 06 12 34 56 78.

// Le protecteur analyse aussi le code et les fichiers de configuration
const api_key = "sk-demo12345678901234567890";
DATABASE_URL="postgresql://admin:motdepasse@db.interne.local/insepti";`;

export function PromptProtector() {
  const [source, setSource] = useState(SAMPLE);
  const findings = useMemo(() => detectSensitiveData(source), [source]);
  const protectedText = useMemo(() => protectSensitiveData(source, findings), [findings, source]);

  return <div className="protector-v4">
    <header><h1>Protecteur de données</h1><p>Détection locale dans les textes, le code et les fichiers de configuration : aucune donnée saisie n’est envoyée à un service tiers.</p></header>
    <nav>{["Analyser", "Réviser", "Valider", "Copier"].map((step, index) => <span key={step} className={index === 0 ? "active" : ""}><b>{String(index + 1).padStart(2, "0")} —</b>{step}</span>)}</nav>
    <div className="protector-v4-grid">
      <main><header><h2>Document ou code à protéger</h2><span>{source.length} caractères · {findings.length} détection{findings.length > 1 ? "s" : ""}</span></header><label><b>VERSION ANALYSÉE · TEXTE, JSON, YAML, ENV, SQL OU CODE</b><textarea spellCheck={false} value={source} onChange={(event) => setSource(event.target.value)} /><div className="protector-types">{Array.from(new Set(findings.map((item) => item.label))).map((label) => <strong key={label}>{label}</strong>)}</div></label><section className="protected-result"><b>VERSION PROTÉGÉE</b><p>{protectedText}</p></section><footer><div><strong>Analyse locale déterministe</strong><p>E-mails, téléphones, identifiants, données financières, secrets cloud, jetons, clés privées et chaînes de connexion. Une relecture humaine reste nécessaire.</p></div><button className="primary-action" onClick={async () => { await navigator.clipboard.writeText(protectedText); showToast({ message: "Version protégée copiée", tone: "success" }); }}>Copier la version protégée</button></footer></main>
      <aside><h2>Diagnostic</h2><p>{findings.length} élément{findings.length > 1 ? "s" : ""} détecté{findings.length > 1 ? "s" : ""}</p>{findings.map((finding) => <article key={finding.id}><header><b>{finding.label.toUpperCase()}</b><span>{finding.confidence} %</span></header><strong>{finding.value}</strong><small>Remplacer par {finding.replacement}</small></article>)}</aside>
    </div>
  </div>;
}
