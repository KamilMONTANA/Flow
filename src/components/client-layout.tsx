"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DrawerProvider } from "@/contexts/drawer-context"
import { RoutesProvider } from "@/contexts/routes-context"
import { Toaster } from "@/components/ui/sonner"

type ClientLayoutProps = {
  children: React.ReactNode
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const appPrefixes = [
    "/dashboard",
    "/reservations",
    "/campsites",
    "/inventory",
    "/documents",
    "/team",
  ]
  const isApp = appPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isLanding = !isApp

  if (isLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <DrawerProvider>
        <RoutesProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
              <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1 size-12 [&>svg]:size-full" />
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <Toaster richColors position="top-right" closeButton />
          </div>
        </RoutesProvider>
      </DrawerProvider>
    </SidebarProvider>
  )
}

export default ClientLayout


