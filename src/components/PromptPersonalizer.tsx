"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "./CopyButton";
import { UseButton } from "./UseButton";
import { applyVariables } from "@/lib/personalize";

export function PromptPersonalizer({ body, variables, applicationName, launchUrl }: { body: string; variables: string[]; applicationName: string; applicationColorClass: string; launchUrl: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const finalText = useMemo(() => applyVariables(body, variables, values), [body, variables, values]);
  return (
    <section className="prompt-personalizer">
      {variables.length > 0 && <div className="personalizer-fields"><div className="section-heading"><div><p className="brand-kicker">Personnalisation</p><h2>Adaptez le prompt à votre besoin</h2></div></div><div>{variables.map((variable,index)=><label key={variable}><span><b>{String(index+1).padStart(2,"0")}</b>{variable}</span><input value={values[variable] ?? ""} onChange={(event)=>setValues((current)=>({...current,[variable]:event.target.value}))} placeholder={`Renseigner ${variable.toLocaleLowerCase("fr")}`} /></label>)}</div></div>}
      <div className="prompt-final"><div className="section-heading"><div><p className="brand-kicker">Prompt final</p><h2>Prêt à être utilisé</h2></div></div><pre>{finalText}</pre><div className="prompt-final-actions"><CopyButton text={finalText} label="Copier"/><UseButton text={finalText} launchUrl={launchUrl} applicationName={applicationName}/></div></div>
    </section>
  );
}
