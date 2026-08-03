"use client";

import { useMemo, useState } from "react";
import { detectSensitiveData, protectSensitiveData } from "@/lib/sensitive-data";
import { showToast } from "@/lib/toast-client";

const SAMPLE = "Prépare une synthèse pour Marie Dupont.\n\nContact : marie.dupont@example.com ou 06 12 34 56 78.\n\nLe budget confidentiel est de 240 k€.\n\nLes éléments détectés restent modifiables avant validation.";

export function PromptProtector() {
  const [source, setSource] = useState(SAMPLE);
  const findings = useMemo(() => detectSensitiveData(source), [source]);
  const protectedText = useMemo(() => protectSensitiveData(source, findings), [findings, source]);

  return <div className="protector-v4">
    <header><h1>Protecteur de données</h1><p>Détection locale des informations sensibles : aucune donnée saisie n’est envoyée à un service tiers.</p></header>
    <nav>{["Analyser", "Réviser", "Valider", "Copier"].map((step, index) => <span key={step} className={index === 0 ? "active" : ""}><b>{String(index + 1).padStart(2, "0")} —</b>{step}</span>)}</nav>
    <div className="protector-v4-grid">
      <main><header><h2>Document à protéger</h2><span>{source.length} caractères · {findings.length} détection{findings.length > 1 ? "s" : ""}</span></header><label><b>VERSION ANALYSÉE</b><textarea value={source} onChange={(event) => setSource(event.target.value)} /><div className="protector-types">{Array.from(new Set(findings.map((item) => item.label))).map((label) => <strong key={label}>{label}</strong>)}</div></label><section className="protected-result"><b>VERSION PROTÉGÉE</b><p>{protectedText}</p></section><footer><div><strong>Prêt pour validation humaine</strong><p>Les détections automatiques doivent toujours être relues avant diffusion.</p></div><button className="primary-action" onClick={async () => { await navigator.clipboard.writeText(protectedText); showToast({ message: "Version protégée copiée", tone: "success" }); }}>Copier la version protégée</button></footer></main>
      <aside><h2>Diagnostic</h2><p>{findings.length} élément{findings.length > 1 ? "s" : ""} détecté{findings.length > 1 ? "s" : ""}</p>{findings.map((finding) => <article key={finding.id}><header><b>{finding.label.toUpperCase()}</b><span>{finding.confidence} %</span></header><strong>{finding.value}</strong><small>Remplacer par {finding.replacement}</small></article>)}</aside>
    </div>
  </div>;
}
