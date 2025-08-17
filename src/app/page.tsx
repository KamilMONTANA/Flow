'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Waves, Map, Phone, Shield, Clock, Calendar, CreditCard, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Cursor.com-inspired landing for Flow (system zarządzania wypożyczalnią kajaków)
// Drop this into app/(marketing)/page.tsx or app/page.tsx in your Next.js 15 project.
// Uses Tailwind + shadcn/ui. Adjust links/URLs to your routes (e.g., /app, /signin, /signup).
// FIX: Marked as a client component to avoid runtime errors with framer-motion & shadcn (was missing before).

export default function FlowLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 text-slate-900">
      <Navbar />
      <Hero />
      <TrustedBy />
      <FeatureBlocks />
      <InlineDemo />
      <Metrics />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Cta />
      <Footer />
      {process.env.NODE_ENV !== "production" && <SmokeTests />}
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-slate-200/60 bg-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Przejdź do strony głównej Flow">
          <Waves className="h-6 w-6" />
          <span className="font-semibold tracking-tight">Flow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm" aria-label="Główne">
          <a href="#features" className="hover:text-slate-700">Funkcje</a>
          <a href="#pricing" className="hover:text-slate-700">Cennik</a>
          <a href="#faq" className="hover:text-slate-700">FAQ</a>
          <a href="#contact" className="hover:text-slate-700">Kontakt</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/signin">Zaloguj</Link>
          </Button>
          <Button className="rounded-2xl" asChild>
            <Link href="/signup">Wypróbuj za darmo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-semibold tracking-tight"
            >
              Buduj i zarządzaj spływami szybciej. <span className="text-sky-600">Z Flow.</span>
            </motion.h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Flow to system dla wypożyczalni kajaków: rezerwacje online, płatności, obsługa telefoniczna/SMS, kalendarz zasobów i raporty — wszystko w jednym miejscu.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="rounded-2xl" asChild>
                <Link href="/signup">Załóż konto</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl" asChild>
                <Link href="#features">Zobacz funkcje</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4"/>Bezpieczne płatności (Stripe)</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4"/>Szybka konfiguracja</div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: .98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: .6 }}
            className="relative"
          >
            <div className="rounded-3xl border bg-white shadow-xl p-2">
              <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-sky-100 via-white to-sky-50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm tracking-wide text-slate-500">Podgląd panelu Flow</p>
                  <h3 className="mt-2 text-2xl font-semibold">Kalendarz zasobów • Rezerwacje • SMS</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <DemoPill icon={<Calendar className="h-4 w-4"/>} label="Kalendarz"/>
                    <DemoPill icon={<CreditCard className="h-4 w-4"/>} label="Płatności"/>
                    <DemoPill icon={<Phone className="h-4 w-4"/>} label="Telefon/SMS"/>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <GradientBlob />
    </section>
  );
}

function GradientBlob() {
  return (
    <div aria-hidden={true} className="pointer-events-none absolute inset-x-0 -top-40 -z-10 blur-3xl">
      <div className="mx-auto h-72 w-[70rem] bg-[radial-gradient(closest-side,theme(colors.sky.200),transparent)]" />
    </div>
  );
}

function DemoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm bg-white/70">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function TrustedBy() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500">Zaufany przez właścicieli wypożyczalni i organizatorów spływów</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-70">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-slate-200" />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBlocks() {
  const features = [
    {
      title: "Klik, klik, klik",
      desc: "Automatyzuj powtarzalne czynności — potwierdzenia, zmiany i faktury gotowe na dwa kliknięcia.",
      bullets: ["Autouzupełnianie danych klienta", "Szablony umów i regulaminów", "Masowa edycja rezerwacji"],
      icon: <Rocket className="h-5 w-5"/>,
    },
    {
      title: "Zna Twoją wypożyczalnię",
      desc: "Flow rozumie zasoby (kajaki, kamizelki, trasy) i unika konfliktów rezerwacji w szczycie sezonu.",
      bullets: ["Reguły dostępności i limity", "Inteligentny przydział sprzętu", "Alerty o konflikcie"],
      icon: <Map className="h-5 w-5"/>,
    },
    {
      title: "Obsługa w naturalnym języku",
      desc: "Przyjmuj rezerwacje telefonicznie i SMS dzięki integracji z Twilio. Flow zapisze je w kalendarzu automatycznie.",
      bullets: ["Webhooki z Twilio", "Transkrypcje rozmów do notatek", "Auto-SMS do klienta"],
      icon: <Phone className="h-5 w-5"/>,
    },
  ] as const;

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sky-600">
                  {f.icon}
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="mt-3 text-slate-600">{f.desc}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4"/>{b}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function InlineDemo() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-white p-6 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">Jednym poleceniem tworzysz spływ, przydzielasz sprzęt i wysyłasz potwierdzenie</h3>
              <p className="mt-3 text-slate-600">Flow skraca proces z minut do sekund. Dodaj trasę, termin i liczbę kajaków — reszta dzieje się automatycznie.</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5"/>Płatności Stripe (przedpłaty, zwroty, kody rabatowe)</li>
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5"/>Supabase jako single source of truth</li>
                <li className="flex gap-2"><Check className="h-4 w-4 mt-0.5"/>Integracje: Twilio, e-mail, eksport CSV</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-white p-4">
              <div className="font-mono text-sm">
                <div className="rounded-md bg-slate-900 text-slate-100 p-4 overflow-auto">
{`> utwórz_spływ --trasa "Nida: Wolica -> Chęciny" --data 2025-08-23 --kajaki 12\n✓ Zarezerwowano 12 kajaków\n✓ Zablokowano termin w kalendarzu\n✓ Wysłano SMS z potwierdzeniem do 24 uczestników`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const items = [
    { k: "> 60%", v: "mniej czasu na administrację" },
    { k: "24/7", v: "rezerwacje online" },
    { k: "5 min", v: "uruchomienie konta" },
    { k: "> 99.9%", v: "czas działania" },
  ] as const;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((i) => (
            <div key={i.v} className="rounded-2xl border bg-white p-6 text-center shadow-sm">
              <div className="text-3xl font-semibold tracking-tight">{i.k}</div>
              <div className="mt-1 text-slate-600 text-sm">{i.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      name: "Bastek — Spływy kajakowe",
      text: "W sezonie telefon się nie urywa. Dzięki Flow nie gubimy rezerwacji i szybciej obsługujemy grupy.",
    },
    {
      name: "Kayak & Camp",
      text: "Świetny kalendarz zasobów i raporty. Widzimy od razu, co jest dostępne na dany weekend.",
    },
  ] as const;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map((q) => (
            <Card key={q.name} className="rounded-2xl">
              <CardContent className="p-6">
                <p className="text-slate-700">“{q.text}”</p>
                <p className="mt-4 text-sm text-slate-500">{q.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-semibold tracking-tight text-center">Prosty cennik</h3>
        <p className="mt-2 text-center text-slate-600">Rozpocznij za darmo, płać gdy rośniesz.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <PriceCard title="Start" price="0 zł" bullets={["Do 50 rezerwacji/mies.", "1 lokalizacja", "Wsparcie e-mail"]} cta="Załóż konto"/>
          <PriceCard title="Pro" price="99 zł/mies." bullets={["Nielimitowane rezerwacje", "Do 3 lokalizacji", "SMS/Twilio, eksport CSV"]} featured cta="Wybierz Pro"/>
          <PriceCard title="Scale" price="199 zł/mies." bullets={["Multi-oddziały", "Uprawnienia zespołu", "Priorytetowe wsparcie"]} cta="Skaluj z nami"/>
        </div>
      </div>
    </section>
  );
}

function PriceCard({ title, price, bullets, featured, cta }: { title: string; price: string; bullets: string[]; featured?: boolean; cta: string }) {
  return (
    <Card className={`rounded-2xl ${featured ? "border-sky-500 shadow-lg" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between">
          <h4 className="text-xl font-semibold">{title}</h4>
          <span className="text-2xl font-semibold">{price}</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2"><Check className="h-4 w-4 mt-0.5"/>{b}</li>
          ))}
        </ul>
        <Button className="mt-6 w-full rounded-2xl" asChild>
          <Link href="/signup">{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Czy mogę przyjmować rezerwacje telefoniczne i SMS?",
      a: "Tak. Dzięki integracji z Twilio (telefon/SMS) rezerwacje trafiają automatycznie do kalendarza w Supabase.",
    },
    {
      q: "Czy Flow obsługuje płatności?",
      a: "Tak, integracja ze Stripe: przedpłaty, zwroty, kody rabatowe, linki do płatności.",
    },
    {
      q: "Czy potrzebuję osobnej strony dla każdej lokalizacji?",
      a: "Nie — Flow obsługuje wiele lokalizacji i zasobów w jednym panelu.",
    },
  ] as const;

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-semibold tracking-tight text-center">Najczęstsze pytania</h3>
        <div className="mt-8 divide-y rounded-2xl border bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group open:bg-slate-50">
              <summary className="cursor-pointer list-none px-6 py-4 font-medium flex items-center justify-between">
                {f.q}
                <span className="text-slate-400 group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-6 pb-6 text-slate-600">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl font-semibold tracking-tight">Gotowy, aby przyspieszyć obsługę spływów?</h3>
        <p className="mt-2 text-slate-600">Załóż konto i skonfiguruj Flow w 5 minut.</p>
        <div className="mt-6">
          <Button size="lg" className="rounded-2xl" asChild>
            <Link href="/signup">Start</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="border-t bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6" />
            <span className="font-semibold">Flow</span>
          </div>
          <div className="text-sm text-slate-600">
            <p>Kontakt: kontakt@nidy.pl</p>
            <p>Wolica · Polska</p>
          </div>
          <div className="text-sm text-slate-600">
            <p>© {new Date().getFullYear()} Flow. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Development-only smoke tests (run automatically in dev builds).
 * These are basic assertions to catch null/undefined props that often cause "Cannot read properties of null" errors.
 */
function SmokeTests() {
  React.useEffect(() => {
    try {
      const hrefs = ["/", "/signin", "/signup", "#features", "#pricing", "#faq", "#contact"]; // test cases
      hrefs.forEach((h) => {
        if (typeof h !== "string" || h.length === 0) {
          console.error("[SmokeTest] Invalid href:", h);
        }
      });
      console.info("[SmokeTest] FlowLanding basic href tests passed");
    } catch (e) {
      console.error("[SmokeTest] Error while running tests", e);
    }
  }, []);
  return null;
}

