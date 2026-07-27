import { LoginExperience } from "@/components/LoginExperience";

export const metadata = {
  title: "Connexion — Bibliothèque de prompts INSEPTI",
  description: "Accédez à la bibliothèque de prompts Microsoft 365 d’INSEPTI.",
};

export default function PublicHomePage() {
  return <LoginExperience />;
}
