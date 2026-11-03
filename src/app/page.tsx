"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  GraduationCap,
  Landmark,
  LayoutGrid,
  Menu,
  Mic,
  MicOff,
  Route,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Briefcase,
  Terminal,
  X,
  AudioLines,
  Fence,
  MessagesSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Types & demo data                                                   */
/* ------------------------------------------------------------------ */

type Role = "visitor" | "tenvy";
interface Message {
  id: number;
  role: Role;
  text: string;
}
type AgentStatus = "idle" | "listening" | "speaking";

/** Swap this for a LiveKit-backed implementation later. */
interface DemoAgentProvider {
  answer(question: string): Promise<string>;
}

const DEMO_QA: { q: string; a: string }[] = [
  {
    q: "What does this business offer?",
    a: "Northwind Studio designs and builds websites and digital products for small teams. I can walk you through our services or our process, whichever you'd like.",
  },
  {
    q: "How does the application process work?",
    a: "Applying has three steps: share a short project brief, join an intro call, then review a written proposal. I can explain any step in more detail.",
  },
  {
    q: "What are the available plans?",
    a: "We offer a Starter build, a Growth build, and a custom engagement. Each has different scope, and I can describe what's included in each one.",
  },
  {
    q: "How can I get started?",
    a: "The best first step is the project brief form. If you're unsure what to write, I can tell you what we usually ask for.",
  },
];

const simulatedProvider: DemoAgentProvider = {
  answer: (question) =>
    new Promise((resolve) => {
      const hit = DEMO_QA.find((x) => x.q === question);
      setTimeout(
        () =>
          resolve(
            hit?.a ??
              "I only know what the business has shared with me, and I don't have that information. I'd suggest contacting the team directly.",
          ),
        700,
      );
    }),
};

const NAV = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
];

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0d]";

function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="#top"
      aria-label="Tenvy home"
      className={`inline-flex items-center gap-2.5 rounded-md ${focusRing} ${className}`}
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

function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-[#f4f2ee] text-[#0a0a0d] hover:bg-white hover:shadow-[0_0_32px_-4px_rgba(139,155,255,.55)]"
      : "border border-white/15 text-[#f4f2ee] hover:border-white/30 hover:bg-white/5";
  return (
    <a href={href} className={`${base} ${styles} ${focusRing} ${className}`}>
      {children}
    </a>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#8b9bff]">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#f4f2ee] sm:text-4xl">
        {title}
      </h2>
      {children && (
        <p className="mt-4 text-base leading-relaxed text-[#a3a3ad]">
          {children}
        </p>
      )}
    </div>
  );
}

function Waveform({ active, bars = 28 }: { active: boolean; bars?: number }) {
  const reduce = useReducedMotion();
  const seeds = useMemo(
    () =>
      Array.from(
        { length: bars },
        (_, i) => 0.35 + ((Math.sin(i * 1.7) + 1) / 2) * 0.65,
      ),
    [bars],
  );
  return (
    <div className="flex h-8 items-center gap-[3px]" aria-hidden="true">
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-[#6d7cff] to-[#b8c1ff]"
          style={{ height: active ? undefined : 4 }}
          animate={
            active && !reduce
              ? { height: [6, 28 * s, 10, 24 * s, 6] }
              : { height: active ? 16 * s : 4 }
          }
          transition={
            active && !reduce
              ? {
                  duration: 1.1 + (i % 5) * 0.12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.03,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

function Bubble({ role, text }: { role: Role; text: string }) {
  const visitor = role === "visitor";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${visitor ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          visitor
            ? "rounded-br-sm bg-[#6d7cff] text-white"
            : "rounded-bl-sm border border-white/10 bg-white/[0.04] text-[#e4e2de]"
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const router = useRouter();

  return (
    <header
      className={`fixed inset-x-0 px-20 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-white/10 bg-[#0a0a0d]/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
      >
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className={`rounded text-sm text-[#a3a3ad] transition-colors hover:text-[#f4f2ee] ${focusRing}`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          <Button href="/auth" className="h-10 px-5">
            Get started
          </Button>
        </div>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-[#f4f2ee] md:hidden ${focusRing}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-white/10 px-5 pb-6 pt-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-base text-[#e4e2de] hover:bg-white/5 ${focusRing}`}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            <Button href="#waitlist" variant="ghost" className="flex-1">
              Sign in
            </Button>
            <Button href="#waitlist" className="flex-1">
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroVisual() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) {
      setStep(3);
      return;
    }
    const t = [
      setTimeout(() => setStep(1), 900),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3200),
    ];
    return () => t.forEach(clearTimeout);
  }, [reduce]);

  const speaking = step === 2;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <div
        className="pointer-events-none absolute -inset-10 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 40%, rgba(109,124,255,.22), transparent 70%)",
        }}
        aria-hidden="true"
      />
      {/* Browser frame */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111116] shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-xs text-[#7d7d88]">
            northwind.example
          </div>
        </div>

        {/* Fake site */}
        <div className="relative h-[380px] bg-[#f4f2ee] p-6 sm:h-[420px]">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-semibold text-neutral-900">
              Northwind Studio
            </span>
            <span className="hidden gap-4 sm:flex">
              <span>Work</span>
              <span>Services</span>
              <span>Process</span>
              <span>Contact</span>
            </span>
          </div>
          <div className="mt-8 max-w-[260px]">
            <div className="h-5 w-full rounded bg-neutral-900" />
            <div className="mt-2 h-5 w-3/4 rounded bg-neutral-900" />
            <div className="mt-4 space-y-1.5">
              <div className="h-2 w-full rounded bg-neutral-300" />
              <div className="h-2 w-5/6 rounded bg-neutral-300" />
            </div>
            <div className="mt-5 h-8 w-28 rounded-full bg-neutral-900" />
          </div>
          <div className="mt-8 grid max-w-[300px] grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-neutral-200" />
            ))}
          </div>

          {/* Widget */}
          <motion.div
            animate={reduce ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4 right-4 w-[min(310px,calc(100%-2rem))] rounded-2xl border border-white/10 bg-[#0a0a0d] p-4 shadow-[0_20px_50px_-12px_rgba(10,10,13,.7)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#8b9bff]/40">
                  <AudioLines
                    size={13}
                    className="text-[#8b9bff]"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-xs font-medium text-[#f4f2ee]">
                  Tenvy guide
                </span>
              </div>
              <span className="text-[10px] text-[#7d7d88]">
                {speaking ? "Speaking" : step >= 3 ? "Ready" : "Listening"}
              </span>
            </div>

            <div className="mt-3 min-h-[148px] space-y-2" aria-live="polite">
              <Bubble
                role="tenvy"
                text="Hi, I'm Northwind's guide. Ask me anything."
              />
              {step >= 1 && (
                <Bubble role="visitor" text="What services do you offer?" />
              )}
              {step >= 2 && (
                <Bubble
                  role="tenvy"
                  text="We help businesses build custom websites and digital products. Would you like to explore our services or learn about our process?"
                />
              )}
            </div>

            <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  step === 1 ? "bg-[#6d7cff]" : "bg-white/10"
                }`}
                aria-hidden="true"
              >
                <Mic size={15} className="text-white" />
              </span>
              <Waveform active={step === 1 || speaking} bars={22} />
            </div>
          </motion.div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[#7d7d88]">
        Illustrative conversation. Not a real customer.
      </p>
    </motion.div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 0%, rgba(109,124,255,.14), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
        <div>
          <Reveal>
            <Eyebrow>The voice layer for your website</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[#f4f2ee] sm:text-5xl lg:text-[56px]">
              Make every website a conversation.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#a3a3ad] sm:text-lg">
              Give your visitors a voice-powered guide that understands your
              business, answers their questions, and helps them find their
              way—all through natural conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#waitlist">
                Create your agent <ArrowRight size={16} aria-hidden="true" />
              </Button>
              <Button href="#how-it-works" variant="ghost">
                See how it works
              </Button>
            </div>
            <p className="mt-5 max-w-md text-sm text-[#7d7d88]">
              No complex integrations. Just your knowledge, a voice, and a
              better visitor experience.
            </p>
          </Reveal>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Problem                                                             */
/* ------------------------------------------------------------------ */

function Problem() {
  const points = [
    "Visitors struggle to find the information they need.",
    "Important product details get buried in long pages.",
    "Application instructions can be difficult to follow.",
    "Visitors leave without asking the questions they came to ask.",
  ];
  return (
    <section id="product" className="border-t border-white/10 py-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-2">
        <Reveal>
          <SectionHeading title="Your website has the answers. Help visitors find them." />
          <p className="mt-8 border-l-2 border-[#8b9bff] pl-5 text-xl font-medium leading-snug text-[#f4f2ee]">
            Tenvy gives your website a guide that visitors can simply talk to.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {points.map((p, i) => (
              <li key={p} className="flex gap-5 py-5">
                <span className="mt-0.5 font-mono text-xs text-[#7d7d88]">
                  0{i + 1}
                </span>
                <span className="text-base leading-relaxed text-[#d4d2ce]">
                  {p}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function StepArt({ kind }: { kind: "teach" | "configure" | "embed" }) {
  const box =
    "flex h-28 items-center justify-center rounded-xl border border-white/10 bg-[#0e0e12] p-4";
  if (kind === "teach")
    return (
      <div className={box} aria-hidden="true">
        <div className="w-full space-y-2">
          {["About us", "Services & pricing", "FAQ", "Application guide"].map(
            (t, i) => (
              <div
                key={t}
                className="flex items-center gap-2 text-[10px] text-[#a3a3ad]"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#8b9bff]"
                  style={{ opacity: 1 - i * 0.18 }}
                />
                {t}
              </div>
            ),
          )}
        </div>
      </div>
    );
  if (kind === "configure")
    return (
      <div className={box} aria-hidden="true">
        <div className="w-full space-y-3">
          {[70, 45, 85].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1 flex-1 rounded-full bg-white/10">
                <span
                  className="block h-1 rounded-full bg-[#8b9bff]"
                  style={{ width: `${w}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className={box} aria-hidden="true">
      <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[10px] text-[#a3a3ad]">
        &lt;script src=&quot;…tenvy&quot; /&gt;
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      kind: "teach" as const,
      label: "Teach",
      title: "Give your agent the information it needs.",
      body: "Add descriptions, products, FAQs, pricing, and step-by-step guides. Your agent knows what you tell it.",
    },
    {
      n: "02",
      kind: "configure" as const,
      label: "Configure",
      title: "Make it sound like your business.",
      body: "Choose the agent's voice, personality, language, communication style, and guidance rules.",
    },
    {
      n: "03",
      kind: "embed" as const,
      label: "Embed",
      title: "Bring your agent to your website.",
      body: "Publish the agent and add the Tenvy widget to your business website.",
    },
  ];
  return (
    <section id="how-it-works" className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From your knowledge to natural conversation."
          />
        </Reveal>
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            className="absolute left-[16%] right-[16%] top-4 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block"
            aria-hidden="true"
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative">
                <span className="relative z-10 mb-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#8b9bff]/50 bg-[#0a0a0d] font-mono text-xs text-[#8b9bff]">
                  {s.n}
                </span>
                <StepArt kind={s.kind} />
                <h3 className="mt-5 text-sm font-medium uppercase tracking-widest text-[#8b9bff]">
                  {s.label}
                </h3>
                <p className="mt-2 text-lg font-medium leading-snug text-[#f4f2ee]">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#a3a3ad]">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive demo                                                    */
/* ------------------------------------------------------------------ */

function Demo({
  provider = simulatedProvider,
}: {
  provider?: DemoAgentProvider;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "tenvy",
      text: "Hi, I'm the Northwind Studio guide. Tap a question or the mic.",
    },
  ]);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [asked, setAsked] = useState<number>(0);
  const idRef = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const busy = status !== "idle";

  useEffect(() => {
    const el = endRef.current?.parentElement;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function ask(question: string) {
    if (busy) return;
    setStatus("listening");
    setMessages((m) => [
      ...m,
      { id: idRef.current++, role: "visitor", text: question },
    ]);
    const reply = await provider.answer(question);
    setStatus("speaking");
    setMessages((m) => [
      ...m,
      { id: idRef.current++, role: "tenvy", text: reply },
    ]);
    timer.current = setTimeout(() => setStatus("idle"), 2600);
  }

  function onMic() {
    ask(DEMO_QA[asked % DEMO_QA.length].q);
    setAsked((n) => n + 1);
  }

  return (
    <section className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading eyebrow="Demo" title="Meet your website's new guide.">
            This is a simulated experience with sample content. It doesn&apos;t
            use your microphone or a live AI model.
          </SectionHeading>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e12] lg:grid-cols-[320px_1fr]">
            {/* Profile */}
            <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
              <p className="text-xs uppercase tracking-widest text-[#7d7d88]">
                Sample business
              </p>
              <h3 className="mt-2 text-lg font-medium text-[#f4f2ee]">
                Northwind Studio
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a3a3ad]">
                A fictional web and product studio used to illustrate how an
                agent answers from owner-provided knowledge.
              </p>
              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ["Voice", "Calm, friendly"],
                  ["Knows", "Services, process, plans"],
                  ["If unsure", "Points to the team"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 border-t border-white/5 pt-3"
                  >
                    <dt className="text-[#7d7d88]">{k}</dt>
                    <dd className="text-right text-[#d4d2ce]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Widget */}
            <div className="flex flex-col p-6">
              <div
                className="h-[280px] space-y-3 overflow-y-auto pr-1"
                role="log"
                aria-live="polite"
                aria-label="Demo conversation"
              >
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <Bubble key={m.id} role={m.role} text={m.text} />
                  ))}
                </AnimatePresence>
                <div ref={endRef} />
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onMic}
                  disabled={busy}
                  aria-label="Ask a sample question with the simulated microphone"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${
                    status === "listening"
                      ? "bg-[#6d7cff]"
                      : "bg-white/10 hover:bg-white/15"
                  } disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  {busy ? (
                    <MicOff size={18} aria-hidden="true" />
                  ) : (
                    <Mic size={18} aria-hidden="true" />
                  )}
                </button>
                <Waveform active={busy} bars={36} />
                <span
                  className="ml-auto text-xs text-[#7d7d88]"
                  aria-live="polite"
                >
                  {status === "idle"
                    ? "Ready"
                    : status === "listening"
                      ? "Listening…"
                      : "Speaking…"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {DEMO_QA.map((x) => (
                  <button
                    key={x.q}
                    type="button"
                    onClick={() => ask(x.q)}
                    disabled={busy}
                    className={`rounded-full border border-white/15 px-3.5 py-2 text-xs text-[#d4d2ce] transition-colors hover:border-[#8b9bff]/60 hover:text-white disabled:opacity-50 ${focusRing}`}
                  >
                    {x.q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Use cases                                                           */
/* ------------------------------------------------------------------ */

function UseCases() {
  const items = [
    {
      icon: Code2,
      title: "SaaS and software",
      body: "Guide users through features, plans, and application workflows.",
      span: "lg:col-span-4",
    },
    {
      icon: ShoppingBag,
      title: "E-commerce",
      body: "Answer questions about products, specifications, and purchasing information.",
      span: "lg:col-span-2",
    },
    {
      icon: GraduationCap,
      title: "Education",
      body: "Explain courses, admissions, programs, and learning options.",
      span: "lg:col-span-2",
    },
    {
      icon: Briefcase,
      title: "Professional services",
      body: "Help visitors understand services, processes, and pricing.",
      span: "lg:col-span-2",
    },
    {
      icon: Landmark,
      title: "Financial services",
      body: "Explain business-provided product information and general service procedures, without unsupported financial claims.",
      span: "lg:col-span-2",
    },
    {
      icon: Route,
      title: "Complex applications",
      body: "Help users understand where to go and what steps to follow.",
      span: "lg:col-span-6",
    },
  ];
  return (
    <section id="use-cases" className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Use cases"
            title="One voice. Many possibilities."
          >
            In every case, an agent&apos;s knowledge depends on the information
            the business owner provides.
          </SectionHeading>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.05} className={it.span}>
              <div
                className={`group h-full rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/25 ${
                  i % 3 === 0
                    ? "bg-[#0e0e12]"
                    : i % 3 === 1
                      ? "bg-white/[0.02]"
                      : "bg-[#101018]"
                }`}
              >
                <it.icon
                  size={20}
                  className="text-[#8b9bff]"
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-base font-medium text-[#f4f2ee]">
                  {it.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a3a3ad]">
                  {it.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

function Features() {
  const items = [
    {
      icon: BookOpen,
      title: "Custom knowledge",
      body: "Give the agent structured business information, FAQs, product details, and guides.",
    },
    {
      icon: MessagesSquare,
      title: "Natural voice conversations",
      body: "A voice-first interface for visitors, powered by LiveKit infrastructure once integrated.",
    },
    {
      icon: SlidersHorizontal,
      title: "Your brand, your agent",
      body: "Configure personality, tone, voice, and communication rules.",
    },
    {
      icon: Route,
      title: "Guided explanations",
      body: "Help visitors understand complex services and application workflows.",
    },
    {
      icon: LayoutGrid,
      title: "Website-ready widget",
      body: "Embed the agent into a supported website with a lightweight integration.",
    },
    {
      icon: Terminal,
      title: "Controlled responses",
      body: "Define how the agent answers, what it can use, and what it says when it doesn't know.",
    },
    {
      icon: Fence,
      title: "Knowledge boundaries",
      body: "The agent uses owner-provided information. It doesn't crawl your site or read the visitor's screen.",
    },
  ];
  return (
    <section className="border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything your website guide needs."
          />
        </Reveal>
        <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <div className="flex gap-4">
                <f.icon
                  size={18}
                  className="mt-1 shrink-0 text-[#8b9bff]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-base font-medium text-[#f4f2ee]">
                    {f.title}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[#a3a3ad]">
                    {f.body}
                  </dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust & control                                                     */
/* ------------------------------------------------------------------ */

function Trust() {
  const controls = [
    "What information the agent receives",
    "How the agent communicates",
    "Which questions it should answer",
    "How it responds when information is missing",
    "Where the widget is allowed to appear, once domain restrictions are available",
  ];
  return (
    <section id="pricing" className="border-t border-white/10 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <ShieldCheck
            size={22}
            className="mb-5 text-[#8b9bff]"
            aria-hidden="true"
          />
          <SectionHeading title="Your business knowledge. Your rules.">
            Tenvy is a guide, not a replacement for your entire website or
            support team. Pricing details will be announced; join the waitlist
            to hear first.
          </SectionHeading>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="space-y-3">
            {controls.map((c) => (
              <li
                key={c}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0e0e12] px-5 py-4 text-sm text-[#d4d2ee]"
              >
                <Check
                  size={16}
                  className="mt-0.5 shrink-0 text-[#8b9bff]"
                  aria-hidden="true"
                />
                <span className="text-[#d4d2ce]">{c}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: connect to a real waitlist endpoint.
    setDone(true);
  }

  return (
    <section id="waitlist" className="px-5 pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e12] px-6 py-20 text-center sm:px-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 70% at 50% 120%, rgba(109,124,255,.35), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[#f4f2ee] sm:text-5xl">
            Your website is ready to talk.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#a3a3ad]">
            Give visitors a more natural way to discover your business,
            understand your offerings, and find their next step.
          </p>

          {done ? (
            <p
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#8b9bff]/40 px-5 py-3 text-sm text-[#f4f2ee]"
              role="status"
            >
              <Check size={16} aria-hidden="true" /> You&apos;re on the
              waitlist. We&apos;ll be in touch.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 text-left">
              <label
                htmlFor="waitlist-email"
                className="mb-2 block text-sm text-[#d4d2ce]"
              >
                Work email
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`h-11 flex-1 rounded-full border border-white/15 bg-black/30 px-5 text-sm text-[#f4f2ee] placeholder:text-[#5f5f6a] ${focusRing}`}
                />
                <button
                  type="submit"
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f4f2ee] px-6 text-sm font-medium text-[#0a0a0d] transition-all hover:bg-white hover:shadow-[0_0_32px_-4px_rgba(139,155,255,.55)] ${focusRing}`}
                >
                  Create your first agent
                </button>
              </div>
            </form>
          )}
          <p className="mt-5 text-sm text-[#7d7d88]">
            Start building with Tenvy.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  const year = new Date().getFullYear();
  const cols: { title: string; links: { label: string; href?: string }[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Overview", href: "#product" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Use cases",
      links: [
        { label: "SaaS, e-commerce, education and more", href: "#use-cases" },
      ],
    },
    { title: "Company", links: [{ label: "About" }, { label: "Contact" }] },
    { title: "Legal", links: [{ label: "Privacy" }, { label: "Terms" }] },
  ];
  return (
    <footer className="border-t border-white/10 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#7d7d88]">
            AI voice guides for websites, built from the knowledge you provide.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-xs font-medium uppercase tracking-widest text-[#a3a3ad]">
              {c.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a
                      href={l.href}
                      className={`rounded text-sm text-[#7d7d88] hover:text-[#f4f2ee] ${focusRing}`}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <span className="text-sm text-[#5f5f6a]">
                      {l.label}{" "}
                      <span className="text-[10px]">(coming soon)</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-5 text-xs text-[#5f5f6a]">
        © {year} Tenvy by Vangrex. All rights reserved.
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden px-20 bg-[#0a0a0d] font-sans text-[#f4f2ee] antialiased selection:bg-[#6d7cff]/40 motion-reduce:scroll-auto">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Demo />
        <UseCases />
        <Features />
        <Trust />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
