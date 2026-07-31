"use client";

import { useMemo, useState } from "react";

export function PromptProtector() {
  const [source, setSource] = useState("");
  const findings = useMemo(() => [
    { label: "Données personnelles", found: /@|email|nom|téléphone|adresse/i.test(source) },
    { label: "Informations confidentielles", found: /client|contrat|budget|confidentiel/i.test(source) },
    { label: "Instruction sensible", found: /mot de passe|secret|token|clé api/i.test(source) },
  ], [source]);
  const risk = findings.filter((item) => item.found).length;
  const protectedText = source.replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[EMAIL MASQUÉ]").replace(/\b\d{10}\b/g, "[TÉLÉPHONE MASQUÉ]");

  return (
    <div className="protector-page">
      <header className="feature-heading"><p className="brand-kicker">Protection avant envoi</p><h1>Contrôlez ce que vous partagez avec une IA</h1><p>Analysez les informations sensibles, comprenez le risque et récupérez une version nettoyée.</p></header>
      <div className="protector-workspace">
        <section className="workspace-panel protector-input"><div className="section-heading"><h2>Contenu source</h2><span>{source.length} caractères</span></div><textarea value={source} onChange={(event) => setSource(event.target.value)} placeholder="Collez ici le texte à contrôler…" /><button type="button" className="primary-action">Analyser le contenu</button></section>
        <section className="workspace-panel protector-analysis"><div className="risk-score"><div><span>Niveau de vigilance</span><strong>{risk === 0 ? "Faible" : risk === 1 ? "Modéré" : "Élevé"}</strong></div><b>{risk}/3</b></div><div className="finding-list">{findings.map((item) => <div key={item.label} className={item.found ? "is-found" : ""}><span aria-hidden="true">{item.found ? "!" : "✓"}</span><p><strong>{item.label}</strong><small>{item.found ? "Élément à vérifier avant utilisation" : "Aucun signal détecté"}</small></p></div>)}</div></section>
        <section className="workspace-panel protector-output"><div className="section-heading"><h2>Version protégée</h2></div><div className="protected-copy">{protectedText || "La version nettoyée apparaîtra ici après votre saisie."}</div><button type="button" className="secondary-action" disabled={!source} onClick={() => navigator.clipboard.writeText(protectedText)}>Copier la version protégée</button></section>
      </div>
    </div>
  );
}
