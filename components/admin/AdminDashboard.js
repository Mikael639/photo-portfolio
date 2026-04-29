"use client";

import { motion } from "framer-motion";

export default function AdminDashboard({ photos, messages, categories, onSelectTab }) {
  const published = photos.filter((photo) => photo.isPublished).length;
  const drafts = photos.length - published;
  const needsReply = messages.filter((message) => message.status === "new" || message.status === "soon").length;

  // Stats par catégorie
  const photoStats = categories.map((cat) => ({
    label: cat,
    count: photos.filter((p) => p.category === cat).length,
  })).sort((a, b) => b.count - a.count);

  // Stats par type de service (messages)
  const serviceStats = Array.from(new Set(messages.map((m) => m.serviceType).filter(Boolean))).map((type) => ({
    label: type,
    count: messages.filter((m) => m.serviceType === type).length,
  })).sort((a, b) => b.count - a.count).slice(0, 4);

  const cards = [
    { label: "Photos en ligne", value: published, tab: "photos", color: "text-emerald-600" },
    { label: "Brouillons", value: drafts, tab: "photos", color: "text-amber-600" },
    { label: "Demandes à traiter", value: needsReply, tab: "messages", color: "text-blue-600" },
    { label: "Thèmes actifs", value: categories.length, tab: "themes", color: "text-ink" },
  ];

  return (
    <div className="space-y-6">
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
            <p className={`mt-3 font-serif text-4xl ${card.color}`}>
              {card.value}
            </p>
          </motion.button>
        ))}
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Graphique Portfolio */}
        <section className="rounded-2xl border border-line/20 bg-white/65 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Répartition Portfolio</h3>
          <div className="mt-6 space-y-4">
            {photoStats.map((stat) => (
              <div key={stat.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-ink/70">{stat.label}</span>
                  <span className="text-ink">{stat.count} photos</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${photos.length > 0 ? (stat.count / photos.length) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-ink/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Graphique Messages */}
        <section className="rounded-2xl border border-line/20 bg-white/65 p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">Demandes par service</h3>
          <div className="mt-6 space-y-4">
            {serviceStats.length > 0 ? (
              serviceStats.map((stat) => (
                <div key={stat.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-ink/70">{stat.label}</span>
                    <span className="text-ink">{stat.count} messages</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${messages.length > 0 ? (stat.count / messages.length) * 100 : 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-accent/40"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-ink/40">Aucune donnée de message disponible.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
