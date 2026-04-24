import ContactExperience from "../../components/contact/ContactExperience";

export const metadata = {
  title: "Contact",
  description: "Contacter Jerrypicsart pour une date, une commande editoriale ou un shooting photo.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  return <ContactExperience />;
}
