import { motion } from "framer-motion";

export default function AdminDashboard({ photos, messages, categories, onSelectTab }) {
  const published = photos.filter((photo) => photo.isPublished).length;
  const drafts = photos.length - published;
  const needsReply = messages.filter((message) => message.status === "new" || message.status === "soon").length;

  const cards = [
    { label: "Photos en ligne", value: published, tab: "photos" },
    { label: "Brouillons", value: drafts, tab: "photos" },
    { label: "Demandes a traiter", value: needsReply, tab: "messages" },
    { label: "Themes actifs", value: categories.length, tab: "themes" },
  ];

  return (
    <motion.section
      className="grid gap-4 md:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      }}
    >
      {cards.map((card) => (
        <motion.button
          key={card.label}
          type="button"
          onClick={() => onSelectTab(card.tab)}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl border border-line/20 bg-white/65 p-5 text-left transition hover:border-ink/30 hover:bg-white"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/45">{card.label}</p>
          <motion.p
            key={card.value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 font-serif text-4xl"
          >
            {card.value}
          </motion.p>
        </motion.button>
      ))}
    </motion.section>
  );
}
