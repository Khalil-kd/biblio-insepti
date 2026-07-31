import Image from "next/image";
import { SPECIALTY_ICON_KEYS, type Difficulty, type Specialty } from "@/lib/prompt-taxonomy";

export function SpecialtyIcon({ specialty, active = false }: { specialty: Specialty; active?: boolean }) {
  const key = SPECIALTY_ICON_KEYS[specialty];
  return (
    <Image
      src={`/icons/specialties/${key}-${active ? "vert" : "gris"}.png`}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 object-contain"
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
