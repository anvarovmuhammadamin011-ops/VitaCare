const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark h-14 px-6 text-base",
  secondary:
    "bg-white border border-neutral-200 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 h-[50px] px-6 text-sm",
  ghost: "bg-transparent text-neutral-500 hover:text-neutral-800 h-auto px-1 text-sm",
  danger: "bg-transparent text-error hover:underline h-auto px-1 text-sm",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
