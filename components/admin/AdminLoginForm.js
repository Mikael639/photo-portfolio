export default function AdminLoginForm({ authForm, errorMessage, onSubmit, onChange }) {
  return (
    <div className="mx-auto max-w-xl px-4 pt-10 md:px-8">
      <h1 className="font-serif text-4xl">Admin Photos</h1>
      <p className="mt-2 text-sm text-ink/70">Connecte-toi pour gerer les publications.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-line/25 bg-white/60 p-5">
        <label className="block space-y-2">
          <span className="text-sm">Username</span>
          <input
            value={authForm.username}
            onChange={(event) => onChange("username", event.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm">Password</span>
          <input
            type="password"
            value={authForm.password}
            onChange={(event) => onChange("password", event.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-line/30 bg-paper px-3 py-2 outline-none focus:border-accent"
            required
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm uppercase tracking-[0.15em] text-paper">
          Se connecter
        </button>
        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
