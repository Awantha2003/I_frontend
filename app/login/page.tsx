"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthShell, { Field, FormError, GoogleButton } from "@/components/AuthShell";
import { api } from "@/lib/api";
import { getToken, saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/inventory");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { token, user } = await api.login({ email: email.trim(), password });
      saveSession(token, user);
      router.replace("/inventory");
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="mb-3 text-center text-3xl font-semibold text-[#101828]">Log in to your account</h1>
      <p className="mb-8 text-center text-base text-[#667085]">Welcome back! Please enter your details.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormError message={serverError} />
        <Field
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#344054]">
            <input type="checkbox" className="h-4 w-4 rounded border-[#D0D5DD]" />
            Remember for 30 days
          </label>
          <span className="font-medium text-[#1366D9]">Forgot password</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#1366D9] px-4 py-2.5 font-medium text-white shadow-sm hover:bg-[#0F56B8] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <GoogleButton label="Sign in with Google" />
      </form>

      <p className="mt-8 text-center text-sm text-[#667085]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-[#1366D9] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
