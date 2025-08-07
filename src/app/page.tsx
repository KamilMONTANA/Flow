import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Flow - System zarządzania dla wypożyczalni kajaków
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Kompleksowe rozwiązanie do zarządzania wypożyczalnią kajaków z polem namiotowym.
                  Zoptymalizuj swoje operacje i zwiększ zyski.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg">Rozpocznij darmowy okres próbny</Button>
                <Button variant="outline" size="lg">Zobacz demo</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Kluczowe funkcjonalności
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Zarządzanie rezerwacjami</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Łatwe zarządzanie rezerwacjami kajaków i miejsc namiotowych w jednym systemie.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Śledzenie dostępności</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Czas rzeczywisty podgląd dostępności sprzętu i miejsc namiotowych.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Raporty i analizy</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Szczegółowe raporty finansowe i analizy trendów sezonowych.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Korzyści z używania Flow
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col space-y-4">
                <h3 className="text-2xl font-bold">Zwiększ efektywność</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Automatyzacja procesów zarządzania pozwala zaoszczędzić czas i zasoby.
                </p>
              </div>
              <div className="flex flex-col space-y-4">
                <h3 className="text-2xl font-bold">Zwiększ zyski</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Lepsze zarządzanie rezerwacjami i dostępnością prowadzi do zwiększenia przychodów.
                </p>
              </div>
              <div className="flex flex-col space-y-4">
                <h3 className="text-2xl font-bold">Popraw obsługę klienta</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Szybsze i bardziej precyzyjne zarządzanie rezerwacjami zwiększa zadowolenie klientów.
                </p>
              </div>
              <div className="flex flex-col space-y-4">
                <h3 className="text-2xl font-bold">Zmniejsz ryzyko błędów</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Systematyczne podejście do zarządzania minimalizuje błędy i nieporozumienia.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Gotowy na transformację swojej wypożyczalni?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Dołącz do setek wypożyczalni, które już korzystają z Flow.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg">Rozpocznij teraz</Button>
                <Button variant="outline" size="lg">Skontaktuj się z nami</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SidebarInset>
  );
}
