"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, AudioLines } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

type Mode = "signin" | "signup";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0d]";

const inputClass = (invalid: boolean) =>
  `h-11 w-full rounded-xl border bg-black/30 px-4 text-sm text-[#f4f2ee] placeholder:text-[#5f5f6a] transition-colors ${
    invalid ? "border-[#ff8a8a]/60" : "border-white/15 hover:border-white/25"
  } ${focusRing}`;

const validators = {
  name: (v: string) => (v.trim().length < 2 ? "Enter your name." : ""),
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? ""
      : "Enter an email like you@company.com.",
  password: (v: string) => (v.length < 8 ? "Use at least 8 characters." : ""),
  required: (v: string) => (v.length === 0 ? "Enter your password." : ""),
};

function Logo() {
  return (
    <a
      href="/"
      aria-label="Tenvy home"
      className={`inline-flex items-center gap-2.5 rounded-md ${focusRing}`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="24"
          height="24"
          rx="8"
          stroke="#8b9bff"
          strokeOpacity=".5"
        />
        <path
          d="M7 9h12M13 9v9"
          stroke="#f4f2ee"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="19" cy="18" r="1.8" fill="#8b9bff" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight text-[#f4f2ee]">
        Tenvy
      </span>
    </a>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  validate,
  autoComplete,
  placeholder,
  hint,
}: {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  validate: (v: string) => string;
  autoComplete: string;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-[#d4d2ce]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-err` : hint ? `${id}-hint` : undefined
          }
          onChange={(e) => {
            onChange(e.target.value);
            // Clear the error as soon as the value becomes valid.
            if (error && !validate(e.target.value)) setError("");
          }}
          onBlur={() => setError(validate(value))}
          className={`${inputClass(!!error)} ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#a3a3ad] hover:bg-white/5 hover:text-[#f4f2ee] ${focusRing}`}
          >
            {show ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-[#ff9c9c]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[#7d7d88]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f4f2ee] px-6 text-sm font-medium text-[#0a0a0d] transition-all hover:bg-white hover:shadow-[0_0_32px_-4px_rgba(139,155,255,.55)] disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
    >
      {loading && (
        <Loader2
          size={16}
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      // validators.name(name) ||
      validators.email(email) ||
      validators.password(password)
    ) {
      setNotice("Check the highlighted fields and try again.");
      return;
    }
    setNotice("");

    // TODO: replace with real sign-up call.
    authClient.signIn.email(
      {
        email: email,
        password: password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onError: (err) => {
          toast.error(err.error.message);
        },
        onResponse: (data) => {
          setLoading(false);
        },
      },
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="tab-signin"
      className="space-y-5"
    >
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        validate={validators.email}
        autoComplete="email"
        placeholder="you@company.com"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        validate={validators.required}
        autoComplete="current-password"
      />
      <div aria-live="polite" className="min-h-[1rem] text-xs text-[#a3a3ad]">
        {notice}
      </div>
      <SubmitButton loading={loading}>Sign in</SubmitButton>
    </form>
  );
}

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      validators.name(name) ||
      validators.email(email) ||
      validators.password(password)
    ) {
      setNotice("Check the highlighted fields and try again.");
      return;
    }
    setNotice("");

    // TODO: replace with real sign-up call.
    authClient.signUp.email(
      {
        email: email,
        password: password,
        name: name,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onError: (err) => {
          toast.error(err.error.message);
        },
        onResponse: (data) => {
          setLoading(false);
        },
      },
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="tab-signup"
      className="space-y-5"
    >
      <Field
        label="Full name"
        value={name}
        onChange={setName}
        validate={validators.name}
        autoComplete="name"
        placeholder="Ada Lovelace"
      />
      <Field
        label="Work email"
        type="email"
        value={email}
        onChange={setEmail}
        validate={validators.email}
        autoComplete="email"
        placeholder="you@company.com"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        validate={validators.password}
        autoComplete="new-password"
        hint="At least 8 characters."
      />
      <div aria-live="polite" className="min-h-[1rem] text-xs text-[#a3a3ad]">
        {notice}
      </div>
      <SubmitButton loading={loading}>Create account</SubmitButton>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TABS: { id: Mode; label: string }[] = [
  { id: "signin", label: "Sign in" },
  { id: "signup", label: "Create account" },
];

const AuthPage = () => {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("signin");
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({
    signin: null,
    signup: null,
  });

  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next: Mode = mode === "signin" ? "signup" : "signin";
    setMode(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0d] font-sans text-[#f4f2ee] antialiased selection:bg-[#6d7cff]/40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 0%, rgba(109,124,255,.14), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1.1fr_1fr]">
        {/* Brand panel */}
        <aside className="hidden flex-col justify-between border-r border-white/10 p-12 lg:flex">
          <Logo />
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#8b9bff]">
              The voice layer for your website
            </p>
            <h2 className="max-w-md text-4xl font-semibold leading-[1.1] tracking-tight">
              Make every website a conversation.
            </h2>
            <div className="mt-10 flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-[#0e0e12] p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#8b9bff]/40">
                <AudioLines
                  size={16}
                  className="text-[#8b9bff]"
                  aria-hidden="true"
                />
              </span>
              <p className="text-sm leading-relaxed text-[#a3a3ad]">
                Teach your agent your business, give it a voice, and embed it on
                your site.
              </p>
            </div>
          </div>
          <p className="text-xs text-[#5f5f6a]">
            © {new Date().getFullYear()} Tenvy
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex flex-col px-5 py-8 sm:px-12">
          <div className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
              <Logo />
            </div>
            <a
              href="/"
              className={`inline-flex items-center gap-1.5 rounded text-sm text-[#a3a3ad] hover:text-[#f4f2ee] ${focusRing}`}
            >
              <ArrowLeft size={14} aria-hidden="true" /> Back to site
            </a>
          </div>

          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your Tenvy account"}
            </h1>
            <p className="mt-2 text-sm text-[#a3a3ad]">
              {mode === "signin"
                ? "Sign in to manage your voice agents."
                : "Start building a voice guide for your website."}
            </p>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Authentication"
              onKeyDown={onTabKey}
              className="mt-8 grid grid-cols-2 rounded-full border border-white/10 bg-[#0e0e12] p-1"
            >
              {TABS.map((t) => {
                const active = mode === t.id;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[t.id] = el;
                    }}
                    id={`tab-${t.id}`}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setMode(t.id)}
                    className={`relative h-9 rounded-full text-sm font-medium transition-colors ${
                      active
                        ? "text-[#0a0a0d]"
                        : "text-[#a3a3ad] hover:text-[#f4f2ee]"
                    } ${focusRing}`}
                  >
                    {active && (
                      <motion.span
                        layoutId={reduce ? undefined : "auth-pill"}
                        className="absolute inset-0 rounded-full bg-[#f4f2ee]"
                        transition={{
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Panels */}
            <div className="mt-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  id={`panel-${mode}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${mode}`}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {mode === "signin" ? <SignInForm /> : <SignUpForm />}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-8 text-center text-sm text-[#7d7d88]">
              {mode === "signin" ? "New to Tenvy?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className={`rounded text-[#f4f2ee] underline underline-offset-4 hover:text-[#8b9bff] ${focusRing}`}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthPage;
