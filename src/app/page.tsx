import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CalendarDays, ChartBar, CreditCard, Map, Shield, Users, Zap } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip link */}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-blue-700 focus:px-3 focus:py-2 focus:text-white">
        Przejdź do treści
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white text-gray-900">
        <div className="container mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2" aria-label="Flow - strona główna">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white font-bold">F</span>
            <span className="text-lg font-semibold tracking-tight">Flow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Główna nawigacja">
            <Link href="#features" className="text-sm text-gray-700 hover:text-gray-900">Funkcje</Link>
            <Link href="#how" className="text-sm text-gray-700 hover:text-gray-900">Jak to działa</Link>
            <Link href="#pricing" className="text-sm text-gray-700 hover:text-gray-900">Cennik</Link>
            <Link href="#faq" className="text-sm text-gray-700 hover:text-gray-900">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="#demo">Demo</Link>
            </Button>
            <Button asChild className="bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700">
              <Link href="#cta">Rozpocznij</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Hero - maksymalna czytelność, AA/AAA */}
        <section aria-labelledby="hero-heading" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-slate-950" />
          {/* Dekoracyjne, animowane tło – niska nieprzezroczystość dla zachowania kontrastu */}
          <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="pointer-events-none absolute left-1/2 top-[-6rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-3xl opacity-20 motion-reduce:opacity-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.65),transparent_60%)] animate-[spin_60s_linear_infinite]" />
            <div className="pointer-events-none absolute -left-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full blur-3xl opacity-15 motion-reduce:opacity-0 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.85),transparent_60%)] animate-[spin_80s_linear_infinite_reverse]" />
            <div className="pointer-events-none absolute right-[-10rem] bottom-[-8rem] h-[30rem] w-[30rem] rounded-full blur-3xl opacity-10 motion-reduce:opacity-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.75),transparent_60%)] animate-[spin_100s_linear_infinite]" />
          </div>
          {/* Subtelny gradient przy dolnej krawędzi dla separacji kolejnej sekcji */}
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-slate-950 to-transparent" aria-hidden>
          </div>

          <div className="container mx-auto px-4 md:px-6 pt-12 pb-16 md:pt-16 md:pb-24 min-h-[32rem] md:min-h-[44rem] flex items-center">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
                Nowość • Panel rezerwacji online i grafiki tras
              </p>
              <h1 id="hero-heading" className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
                System rezerwacji dla wypożyczalni kajaków i pól namiotowych
              </h1>
              <p className="mt-6 text-base md:text-xl text-white/90">
                Rezerwacje online, harmonogram tras, inwentarz, płatności i raporty – w jednym, prostym narzędziu.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white focus-visible:ring-white" aria-label="Rozpocznij darmowy okres próbny">
                  Rozpocznij darmowy okres próbny
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/80 text-white hover:bg-white/10 focus-visible:ring-white" aria-label="Zobacz demo">
                  Zobacz demo
                </Button>
              </div>
              <dl className="mt-12 grid grid-cols-3 gap-6 text-white/90">
                <div className="text-center">
                  <dt className="text-xs uppercase tracking-wide text-white/70">Mniej telefonów</dt>
                  <dd className="text-3xl md:text-4xl font-extrabold">40%</dd>
                </div>
                <div className="text-center">
                  <dt className="text-xs uppercase tracking-wide text-white/70">Szybsza obsługa</dt>
                  <dd className="text-3xl md:text-4xl font-extrabold">2×</dd>
                </div>
                <div className="text-center">
                  <dt className="text-xs uppercase tracking-wide text-white/70">Dostępność</dt>
                  <dd className="text-3xl md:text-4xl font-extrabold">99.9%</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Trusted logos */}
        <section className="py-10 md:py-12" aria-label="Zaufali nam">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-sm text-gray-500">Zaufali nam organizatorzy spływów i pola namiotowe</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-6 items-center opacity-70">
              <Image src="/vercel.svg" alt="Logo partnera 1" width={120} height={32} className="mx-auto h-8 w-auto" />
              <Image src="/next.svg" alt="Logo partnera 2" width={120} height={32} className="mx-auto h-8 w-auto" />
              <Image src="/globe.svg" alt="Logo partnera 3" width={120} height={32} className="mx-auto h-8 w-auto" />
              <Image src="/window.svg" alt="Logo partnera 4" width={120} height={32} className="mx-auto h-8 w-auto" />
              <Image src="/file.svg" alt="Logo partnera 5" width={120} height={32} className="mx-auto h-8 w-auto" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-heading" className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Funkcje, które przyspieszają Twój biznes</h2>
              <p className="mt-3 text-gray-700">Od rezerwacji po raporty. Flow porządkuje codzienność w sezonie i poza nim.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                    <CardTitle className="text-base">Rezerwacje online</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Intuicyjna rezerwacja z kalendarzem dostępności i automatycznymi potwierdzeniami.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Map className="h-5 w-5" />
                    <CardTitle className="text-base">Trasy i grafiki</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Planowanie i przypisywanie kursów: dowozy, odbiory, miejsca startu i mety.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Users className="h-5 w-5" />
                    <CardTitle className="text-base">CRM klientów</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Historia rezerwacji, notatki, statusy, szybki kontakt SMS/Email.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-blue-700">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle className="text-base">Płatności i faktury</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Przedpłaty online, rozliczenia, automatyczne dokumenty sprzedaży.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Shield className="h-5 w-5" />
                    <CardTitle className="text-base">Dostępność i bezpieczeństwo</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Szyfrowanie, kopie zapasowe, wysoka niezawodność 99.9% w sezonie.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-blue-700">
                    <ChartBar className="h-5 w-5" />
                    <CardTitle className="text-base">Raporty i analizy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Przychody, obłożenie, popularne trasy i sprzęt – zawsze pod ręką.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-heading" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="how-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Jak to działa</h2>
              <p className="mt-3 text-gray-700">Start w mniej niż 24h. Bez skomplikowanych wdrożeń.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="text-blue-800 font-semibold">1. Szybka konfiguracja</div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Dodaj sprzęt, trasy, cennik i grafiki. Zaimportujemy Twoje dane.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-blue-800 font-semibold">2. Uruchom rezerwacje</div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Otrzymujesz link do formularza rezerwacji i panel obsługi.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-blue-800 font-semibold">3. Zarządzaj i rośnij</div>
                </CardHeader>
                <CardContent className="text-sm text-gray-800 leading-6">Harmonogram, powiadomienia, płatności i raporty – wszystko w jednym miejscu.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-heading" className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Prosty i przejrzysty cennik</h2>
              <p className="mt-3 text-gray-700">Dopasowany do wielkości wypożyczalni. Bez ukrytych kosztów.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-xl">Start</CardTitle>
                  <p className="text-3xl font-bold mt-1">99 zł <span className="text-base font-normal text-gray-500">/ miesiąc</span></p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Do 50 rezerwacji / mies.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Kalendarz dostępności</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Podstawowe raporty</li>
                  </ul>
                  <Button className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white">Wybierz plan</Button>
                </CardContent>
              </Card>
              <Card className="border-blue-200 shadow-lg ring-1 ring-blue-100">
                <CardHeader>
                  <div className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Polecany</span>
                  </div>
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <p className="text-3xl font-bold mt-1">249 zł <span className="text-base font-normal text-gray-500">/ miesiąc</span></p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Nielimitowane rezerwacje</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Trasy, grafiki i płatności</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Zaawansowane raporty</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Priorytetowe wsparcie</li>
                  </ul>
                  <Button className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white">Wybierz plan</Button>
                </CardContent>
              </Card>
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <p className="text-3xl font-bold mt-1">Indywidualnie</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Dedykowane integracje</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Umowa SLA</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-700" /> Indywidualne wdrożenie</li>
                  </ul>
                  <Button variant="outline" className="mt-6 w-full">Skontaktuj się</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="testimonials-heading" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <h2 id="testimonials-heading" className="sr-only">Opinie klientów</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-sm text-gray-900 leading-7">
                  „W sezonie telefon nie przestawał dzwonić. Z Flow 80% rezerwacji wpada online. Mamy porządek i czas na klientów.”
                  <div className="mt-4 text-xs text-gray-600">Właściciel wypożyczalni – Mazury</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm text-gray-900 leading-7">
                  „Grafik tras z automatycznymi przypomnieniami kierowców to game changer. Koniec z pomyłkami.”
                  <div className="mt-4 text-xs text-gray-600">Koordynator logistyki – Pomorze</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm text-gray-900 leading-7">
                  „Raporty sugerują, które trasy promować. Sprzedaż wzrosła o 23% r/r.”
                  <div className="mt-4 text-xs text-gray-600">Manager – Podlasie</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-heading" className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Najczęstsze pytania</h2>
              <p className="mt-3 text-gray-700">Krótko i rzeczowo – jeśli potrzebujesz więcej, napisz do nas.</p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl space-y-4">
              <details className="group rounded-lg border bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">Czy mogę przenieść istniejące rezerwacje?</span>
                  <Zap className="h-4 w-4 text-blue-700 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-gray-800 leading-6">Tak. Pomożemy w imporcie z arkuszy lub poprzedniego systemu.</p>
              </details>
              <details className="group rounded-lg border bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">Jak działa okres próbny?</span>
                  <Zap className="h-4 w-4 text-blue-700 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-gray-800 leading-6">14 dni bez opłat. Pełna funkcjonalność. Bez karty.</p>
              </details>
              <details className="group rounded-lg border bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">Czy wspieracie pola namiotowe i dodatki?</span>
                  <Zap className="h-4 w-4 text-blue-700 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-gray-800 leading-6">Tak. Flow obsługuje miejsca noclegowe i dodatki jak ognisko, prąd, wywóz grupy.</p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" aria-labelledby="cta-heading" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 to-blue-700 p-8 md:p-10 text-white">
              <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold">Gotowy, aby uporządkować rezerwacje?</h2>
              <p className="mt-2 text-white/90">Uruchom Flow i zacznij przyjmować rezerwacje online jeszcze dziś.</p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <Button className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50" aria-label="Rozpocznij teraz">Rozpocznij teraz</Button>
                <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10" aria-label="Skontaktuj się">Skontaktuj się</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-700 text-white font-bold">F</span>
            <span className="text-sm text-gray-700">© {new Date().getFullYear()} Flow. Wszelkie prawa zastrzeżone.</span>
          </div>
          <nav className="flex items-center gap-6 text-sm" aria-label="Linki w stopce">
            <Link href="#features" className="text-gray-700 hover:text-gray-900">Funkcje</Link>
            <Link href="#pricing" className="text-gray-700 hover:text-gray-900">Cennik</Link>
            <Link href="#faq" className="text-gray-700 hover:text-gray-900">FAQ</Link>
            <Link href="#" className="text-gray-700 hover:text-gray-900">Polityka prywatności</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Home;

