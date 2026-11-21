"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  Wrench,
} from "lucide-react";

const enlaces = [
  { href: "/", label: "Dashboard", icono: LayoutDashboard },
  { href: "/pos", label: "Punto de venta", icono: ShoppingCart },
  { href: "/productos", label: "Productos", icono: Package },
  { href: "/inventario", label: "Inventario", icono: Boxes },
  { href: "/ventas", label: "Ventas", icono: Receipt },
];

function activo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-slate-900 md:flex">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
          <Wrench size={20} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Ferretería</p>
          <p className="text-xs text-slate-400">El Tornillo de Oro</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {enlaces.map((e) => {
          const Icono = e.icono;
          const on = activo(pathname, e.href);
          return (
            <Link
              key={e.href}
              href={e.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                on
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icono size={18} />
              {e.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[11px] leading-relaxed text-slate-400">
          Sistema de gestión · Inventario y ventas
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
      {enlaces.map((e) => {
        const Icono = e.icono;
        const on = activo(pathname, e.href);
        return (
          <Link
            key={e.href}
            href={e.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
              on ? "bg-orange-500 text-white" : "text-slate-600"
            }`}
          >
            <Icono size={15} />
            {e.label}
          </Link>
        );
      })}
    </nav>
  );
}
