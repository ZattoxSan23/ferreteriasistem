import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { obtenerConfiguracion } from "@/server/ventas";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de gestión de ferretería",
  description: "Inventario, punto de venta y boletas para ferretería",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await obtenerConfiguracion().catch(() => null);
  const nombre = config?.nombreFerreteria ?? "Ferretería El Tornillo de Oro";
  const direccion = config?.direccion ?? "Sucursal principal";

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-100 font-sans text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {nombre}
                </p>
                <p className="text-xs text-slate-400">{direccion}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  C1
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold text-slate-800">Caja 01</p>
                  <p className="text-xs text-slate-400">Turno activo</p>
                </div>
              </div>
            </header>
            <MobileNav />
            <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
