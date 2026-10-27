"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell, { Field, FormError, GoogleButton } from "@/components/AuthShell";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { name?: string; email?: string; password?: string };

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const body = { name: form.name.trim(), email: form.email.trim(), password: form.password };
      await api.signup(body);
      // Log straight in after creating the account
      const { token, user } = await api.login({ email: body.email, password: body.password });
      saveSession(token, user);
      router.replace("/inventory");
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <AuthShell>
      <h1 className="mb-3 text-center text-3xl font-semibold text-[#101828]">Create an account</h1>
      <p className="mb-8 text-center text-base text-[#667085]">Start your 30-day free trial.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormError message={serverError} />
        <Field label="Name*" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
        <Field
          label="Email*"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Password*"
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="Must be at least 8 characters."
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#1366D9] px-4 py-2.5 font-medium text-white shadow-sm hover:bg-[#0F56B8] disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Get started"}
        </button>
        <GoogleButton label="Sign up with Google" />
      </form>

      <p className="mt-8 text-center text-sm text-[#667085]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#1366D9] hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
