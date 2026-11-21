import { ArrowDownLeft, ArrowUpRight, Settings2 } from "lucide-react";

export function TipoBadge({ tipo }: { tipo: string }) {
  if (tipo === "ENTRADA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <ArrowDownLeft size={12} /> Entrada
      </span>
    );
  }
  if (tipo === "SALIDA") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
        <ArrowUpRight size={12} /> Salida
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
      <Settings2 size={12} /> Ajuste
    </span>
  );
}
