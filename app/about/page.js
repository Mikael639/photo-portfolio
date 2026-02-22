export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pt-10 md:px-8">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/70">About</p>
      <h1 className="font-serif text-4xl md:text-6xl">L&apos;oeil derriere Jerrypicsart</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-ink/80">
        Jerrypicsart accompagne les evenements ou l&apos;image doit etre a la fois belle et utile: fashion week, mariages,
        services d&apos;eglise et concerts. L&apos;objectif est simple: livrer des photos fortes, coherentes et exploitables
        rapidement pour la communication.
      </p>
    </div>
  );
}
