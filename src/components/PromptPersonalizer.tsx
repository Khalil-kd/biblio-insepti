"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "./CopyButton";
import { UseButton } from "./UseButton";
import { applyVariables } from "@/lib/personalize";

export function PromptPersonalizer({
  body,
  variables,
  applicationName,
  applicationColorClass,
  launchUrl,
}: {
  body: string;
  variables: string[];
  applicationName: string;
  applicationColorClass: string;
  launchUrl: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const finalText = useMemo(() => applyVariables(body, variables, values), [body, variables, values]);

  return (
    <div className="flex flex-col gap-6">
      {variables.length > 0 && (
        <section className={`rounded-xl2 border-2 p-5 ${applicationColorClass}`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">À personnaliser</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {variables.map((variable) => (
              <div key={variable} className="flex flex-col gap-1.5">
                <label htmlFor={`var-${variable}`} className="text-sm font-medium">
                  {variable}
                </label>
                <input
                  id={`var-${variable}`}
                  type="text"
                  value={values[variable] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [variable]: e.target.value }))}
                  placeholder={`Remplacez [${variable}]`}
                  className="focus-ring surface rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`rounded-xl2 border-2 p-5 ${applicationColorClass}`}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Prompt prêt à copier</h2>
        <pre className="mb-4 whitespace-pre-wrap font-sans text-sm leading-relaxed">{finalText}</pre>
        <div className="flex flex-wrap gap-3">
          <CopyButton text={finalText} />
          <UseButton text={finalText} launchUrl={launchUrl} applicationName={applicationName} />
        </div>
      </section>
    </div>
  );
}
