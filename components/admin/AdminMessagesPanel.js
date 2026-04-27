const statusLabels = {
  new: "A traiter",
  soon: "Repondre vite",
  replied: "Repondu",
  archived: "Archive",
};

function formatDate(value) {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminMessagesPanel({ messages, onUpdateStatus }) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-line/20 bg-white/65 p-5">
        <h2 className="font-serif text-3xl">Demandes contact</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
          Ici, Jerrypicsart peut suivre les demandes recues depuis le formulaire et marquer ce qui reste a traiter.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-line/20 bg-white/55 p-8 text-center text-sm text-ink/60">
          Aucun message pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-line/20 bg-white/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-ink/45">{formatDate(message.createdAt)}</p>
                  <h3 className="mt-2 font-serif text-2xl">{message.name}</h3>
                  <p className="text-sm text-ink/65">
                    {message.email}
                    {message.phone ? ` | ${message.phone}` : ""}
                  </p>
                </div>
                <select
                  value={message.status || "new"}
                  onChange={(event) => onUpdateStatus(message.id, event.target.value)}
                  className="rounded-full border border-line/25 bg-paper px-4 py-2 text-sm"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-ink/70 md:grid-cols-3">
                <p>
                  <span className="font-semibold text-ink">Prestation:</span> {message.serviceType}
                </p>
                <p>
                  <span className="font-semibold text-ink">Lieu:</span> {message.location || "Non precise"}
                </p>
                <p>
                  <span className="font-semibold text-ink">Date:</span> {message.eventDate || "Non precisee"}
                </p>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-paper/70 p-4 text-sm leading-relaxed text-ink/75">
                {message.project}
              </p>

              {message.referenceLink ? (
                <a
                  href={message.referenceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-full border border-line/25 px-4 py-2 text-sm hover:border-ink"
                >
                  Ouvrir la reference
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
