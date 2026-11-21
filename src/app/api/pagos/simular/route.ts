import type { NextRequest } from "next/server";
import { pagoSchema } from "@/lib/validaciones";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pagoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Datos de pago inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  if (parsed.data.forzarRechazo) {
    return Response.json(
      {
        aprobado: false,
        mensaje: "Pago rechazado por el banco emisor.",
      },
      { status: 402 }
    );
  }

  return Response.json({
    aprobado: true,
    referencia: `TRX-${parsed.data.metodo}-${Date.now().toString(36).toUpperCase()}`,
    mensaje: "Pago aprobado.",
  });
}
