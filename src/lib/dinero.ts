const formatoMoneda = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatoSoles(centimos: number): string {
  return formatoMoneda.format(centimos / 100);
}

export function soles(centimos: number): number {
  return centimos / 100;
}

export function aCentimos(valor: number): number {
  return Math.round(valor * 100);
}

export function desglosarIgv(totalConIgv: number, igvPorcentaje: number) {
  const subtotal = Math.round(totalConIgv / (1 + igvPorcentaje / 100));
  return { subtotal, igv: totalConIgv - subtotal, total: totalConIgv };
}

export function formatearCorrelativo(serie: string, numero: number): string {
  return `${serie}-${String(numero).padStart(6, "0")}`;
}

export function fechaHora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(d);
}

export function fechaCorta(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeZone: "America/Lima",
  }).format(d);
}
