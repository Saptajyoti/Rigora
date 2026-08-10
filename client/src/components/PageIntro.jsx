export default function PageIntro({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="rigora-kicker">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
        )}
      </div>
      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </header>
  );
}
