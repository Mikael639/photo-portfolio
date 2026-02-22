import ContactForm from "../../components/ContactForm";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pt-10 md:px-8">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/70">Contact</p>
      <h1 className="font-serif text-4xl md:text-6xl">Parlons de votre prochain evenement</h1>
      <p className="max-w-2xl text-ink/75">
        Indique le type de prestation, la date et le lieu pour recevoir une reponse plus rapide et mieux ciblee.
      </p>

      <ContactForm />
    </div>
  );
}
