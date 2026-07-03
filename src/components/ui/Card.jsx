export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white border border-neutral-200 rounded-card p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
