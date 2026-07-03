export default function Wordmark({ className = "h-11 w-auto" }) {
  return (
    <img
      src="/logo.jpg"
      alt="VitaCare"
      className={`mix-blend-multiply ${className}`}
    />
  );
}
