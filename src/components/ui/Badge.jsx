const tones = {
  success: "bg-primary-light text-primary-dark",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-secondary-light text-secondary",
};

export default function Badge({ tone = "info", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
