export default function Pill({ active = false, className = "", children, ...props }) {
  return (
    <button
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
