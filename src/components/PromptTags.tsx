import Image from "next/image";
import { SPECIALTY_ICON_KEYS, type Difficulty, type Specialty } from "@/lib/prompt-taxonomy";

export function SpecialtyIcon({ specialty, active = false }: { specialty: Specialty; active?: boolean }) {
  if (specialty === "Microsoft 365") return <Image src="/icons/copilot.svg" alt="" width={20} height={20} className={`specialty-icon-m365 ${active ? "is-active" : ""}`} unoptimized />;
  const key = SPECIALTY_ICON_KEYS[specialty];
  return (
    <Image
      src={`/icons/specialties/${key}-${active ? "vert" : "gris"}.png`}
      alt=""
      width={20}
      height={20}
      className="h-5 w-5 shrink-0 object-contain"
      unoptimized
    />
  );
}

export function DifficultyTag({ value }: { value: Difficulty }) {
  const className = value === "Débutant"
    ? "difficulty-beginner"
    : value === "Intermédiaire"
      ? "difficulty-intermediate"
      : "difficulty-advanced";
  return <span className={`prompt-tag ${className}`}>{value}</span>;
}

export function SpecialtyTag({ value }: { value: Specialty }) {
  return (
    <span className="prompt-tag specialty-tag">
      <SpecialtyIcon specialty={value} active />
      {value}
    </span>
  );
}

export function AiTag({ value }: { value: string }) {
  return (
    <span className="prompt-tag ai-tag">
      <span aria-hidden="true" className="ai-mark">AI</span>
      {value}
    </span>
  );
}

export function OriginTag({ sourceType }: { sourceType: "insepti" | "personal" }) {
  return <span className={`prompt-tag origin-tag ${sourceType === "insepti" ? "is-insepti" : "is-personal"}`}>{sourceType === "insepti" ? "INSEPTI" : "Personnel"}</span>;
}
