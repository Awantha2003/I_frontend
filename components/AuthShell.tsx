import Logo from "./Logo";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-white">
      <section className="hidden flex-1 items-center justify-center lg:flex">
        <div className="flex flex-col items-center gap-6">
          <Logo size={160} withText={false} />
          <span className="text-5xl font-semibold tracking-wide text-[#1366D9]">KANBAN</span>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">
          <div className="mb-6 flex justify-center">
            <Logo size={48} withText={false} />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

export function Field({
  label,
  error,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#344054]">{label}</span>
      <input
        {...props}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-base text-[#101828] shadow-sm outline-none placeholder:text-[#667085] focus:ring-4 ${
          error
            ? "border-[#FDA29B] focus:ring-[#FEE4E2]"
            : "border-[#D0D5DD] focus:border-[#84ADFF] focus:ring-[#D1E0FF]"
        }`}
      />
      {error ? (
        <span className="mt-1.5 block text-sm text-[#F04438]">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-sm text-[#667085]">{hint}</span>
      )}
    </label>
  );
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Google sign-in is not part of this module"
      className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2.5 font-medium text-[#344054] shadow-sm"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24" />
        <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9" />
      </svg>
      {label}
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-[#FDA29B] bg-[#FEF3F2] px-3.5 py-2.5 text-sm text-[#B42318]">
      {message}
    </div>
  );
}
