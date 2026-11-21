"use client";

import { useState } from "react";
import { Download, Loader2, MessageCircle, Send } from "lucide-react";
import { formatoSoles } from "@/lib/dinero";

function normalizarTelefono(telefono?: string | null): string | null {
  if (!telefono) return null;
  const digitos = telefono.replace(/\D/g, "");
  if (!digitos) return null;
  if (digitos.length === 9) return `51${digitos}`;
  if (digitos.length === 11 && digitos.startsWith("51")) return digitos;
  return digitos;
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function BoletaActions({
  ventaId,
  correlativo,
  total,
  clienteNombre,
  clienteTelefono,
  nombreFerreteria,
}: {
  ventaId: number;
  correlativo: string;
  total: number;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  nombreFerreteria: string;
}) {
  const [estado, setEstado] = useState<"idle" | "preparando" | "listo" | "error">("idle");
  const [mensaje, setMensaje] = useState("");

  const texto = `*${nombreFerreteria}*\nBoleta *${correlativo}*\nCliente: ${
    clienteNombre || "Cliente varios"
  }\nTotal: ${formatoSoles(total)}\n\n¡Gracias por su compra! Adjuntamos su boleta en PDF.`;

  const telefono = normalizarTelefono(clienteTelefono);
  const waHref = `https://wa.me/${telefono ?? ""}?text=${encodeURIComponent(texto)}`;

  async function obtenerPdf() {
    const res = await fetch(`/api/ventas/${ventaId}/pdf`);
    if (!res.ok) throw new Error("No se pudo generar el PDF.");
    return res.blob();
  }

  async function descargar() {
    setEstado("preparando");
    setMensaje("");
    try {
      const blob = await obtenerPdf();
      descargarBlob(blob, `boleta-${correlativo}.pdf`);
      setEstado("listo");
      setMensaje("PDF descargado correctamente.");
    } catch {
      setEstado("error");
      setMensaje("No se pudo descargar el PDF.");
    }
  }

  async function compartir() {
    setEstado("preparando");
    setMensaje("");
    try {
      const blob = await obtenerPdf();
      const file = new File([blob], `boleta-${correlativo}.pdf`, { type: "application/pdf" });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
        share?: (data?: ShareData) => Promise<void>;
      };

      if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: `Boleta ${correlativo}`, text: texto });
        setEstado("listo");
        setMensaje("Boleta compartida por WhatsApp.");
      } else {
        descargarBlob(blob, `boleta-${correlativo}.pdf`);
        window.open(waHref, "_blank", "noopener,noreferrer");
        setEstado("listo");
        setMensaje("Descargamos el PDF y abrimos WhatsApp. Adjunta el archivo descargado.");
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setEstado("idle");
        return;
      }
      setEstado("error");
      setMensaje("No se pudo compartir el archivo. Descárgalo y envíalo manualmente.");
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <MessageCircle size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-slate-800">Enviar boleta</h2>
          <p className="text-xs text-slate-400">Comparte el PDF por WhatsApp</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={compartir}
          disabled={estado === "preparando"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {estado === "preparando" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Enviar por WhatsApp
        </button>
        <button
          onClick={descargar}
          disabled={estado === "preparando"}
          className="btn-ghost w-full"
        >
          <Download size={16} /> Descargar PDF
        </button>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-medium text-slate-400 hover:text-emerald-600">
          Solo abrir chat de WhatsApp
        </a>
      </div>

      {clienteTelefono ? (
        <p className="mt-3 text-xs text-slate-500">
          Se enviará a <strong>{clienteTelefono}</strong>
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-400">
          El cliente no tiene teléfono registrado. Igual puedes compartir el archivo.
        </p>
      )}

      {mensaje && (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
            estado === "error"
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {mensaje}
        </p>
      )}

      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
        <p className="font-semibold text-slate-600">Vista previa del mensaje</p>
        <pre className="mt-1 whitespace-pre-wrap font-sans">{texto.replace(/\*/g, "")}</pre>
      </div>
    </div>
  );
}
