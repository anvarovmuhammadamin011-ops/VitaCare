export default function PageHeader({ title, subtitle }) {
  return (
    <header className="px-4 pb-2 pt-6">
      <h1 className="text-h2 font-bold text-neutral-900">{title}</h1>
      {subtitle && <p className="mt-1 text-small text-neutral-500">{subtitle}</p>}
    </header>
  );
}
