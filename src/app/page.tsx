import { LoginExperience } from "@/components/LoginExperience";

export const metadata = {
  title: "Bibliothèque de prompts — INSEPTI",
  description: "La bibliothèque officielle de prompts INSEPTI pour les collaborateurs autorisés.",
};

export default function PublicHomePage() {
  return <LoginExperience />;
}
