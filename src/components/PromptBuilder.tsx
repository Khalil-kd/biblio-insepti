"use client";

import { useMemo, useState } from "react";

const STARTER = "Tu es @role. Crée @format pour @audience à partir de @contexte. Le résultat doit respecter @contraintes.";

export function PromptBuilder() {
  const [template, setTemplate] = useState(STARTER);
  const [values, setValues] = useState<Record<string, string>>({});
  const variables = useMemo(() => Array.from(new Set(Array.from(template.matchAll(/@([\p{L}\d_-]+)/gu), (match) => match[1] ?? "").filter(Boolean))), [template]);
  const result = useMemo(() => variables.reduce((text, variable) => text.replaceAll(`@${variable}`, values[variable]?.trim() || `@${variable}`), template), [template, values, variables]);

  return (
    <div className="builder-layout">
      <section className="workspace-panel builder-editor">
        <div className="section-heading"><div><p className="brand-kicker">Structure</p><h1>Construisez votre prompt</h1></div><span>{variables.length} champs détectés</span></div>
        <p className="section-intro">Écrivez naturellement et préfixez chaque information à personnaliser avec <strong>@</strong>.</p>
        <label className="builder-textarea-label" htmlFor="prompt-template">Modèle du prompt</label>
        <textarea id="prompt-template" value={template} onChange={(event) => setTemplate(event.target.value)} className="builder-textarea" />
        <div className="builder-advice">
          <p><b>01.</b><span><strong>Rôle</strong> — précisez l’expertise attendue.</span></p>
          <p><b>02.</b><span><strong>Contexte</strong> — donnez uniquement les informations utiles.</span></p>
          <p><b>03.</b><span><strong>Format</strong> — décrivez la forme exacte du livrable.</span></p>
          <p><b>04.</b><span><strong>Contraintes</strong> — fixez le ton, la longueur et les limites.</span></p>
        </div>
      </section>

      <section className="workspace-panel builder-fields">
        <div className="section-heading"><div><p className="brand-kicker">Personnalisation</p><h2>Champs à remplir</h2></div></div>
        <div className="builder-field-list">
          {variables.map((variable, index) => (
            <label key={variable} htmlFor={`builder-${variable}`}>
              <span><b>{String(index + 1).padStart(2, "0")}</b>@{variable}</span>
              <input id={`builder-${variable}`} value={values[variable] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [variable]: event.target.value }))} placeholder={`Saisir ${variable}`} />
            </label>
          ))}
        </div>
        <div className="builder-result"><p>Prompt généré</p><div>{result}</div></div>
        <div className="builder-actions"><button type="button" className="secondary-action">Sauvegarder</button><button type="button" className="primary-action" onClick={() => navigator.clipboard.writeText(result)}>Copier le prompt</button></div>
      </section>
    </div>
  );
}
