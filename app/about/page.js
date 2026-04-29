import AboutExperience from "../../components/about/AboutExperience";
import { getAboutCopy } from "../../lib/siteSettings";

export const metadata = {
  title: "À propos",
  description:
    "Le parcours de Jerrypicsart, photographe entre mode, events, celebrities, studio et fashion wedding.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const aboutCopy = await getAboutCopy();
  return <AboutExperience aboutCopy={aboutCopy} />;
}
