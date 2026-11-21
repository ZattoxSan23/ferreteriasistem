# Ferretería Demo

Sistema de gestión **simulado** para una ferretería: control de inventario,
punto de venta, boleta en PDF y envío por WhatsApp. Pensado como demo visual y
funcional local, **sin integraciones reales** (ni SUNAT ni pasarelas de pago).

## Qué incluye

- **Dashboard**: ingresos y ventas del día, valor del inventario, alertas de stock y productos más vendidos.
- **Productos**: catálogo con búsqueda, alta y edición, activación/desactivación.
- **Inventario**: entradas de mercadería, ajustes de conteo y kardex por producto.
- **Punto de venta (POS)**: buscador, carrito, datos de cliente, IGV y métodos de pago.
- **Pago simulado**: efectivo (con vuelto), tarjeta (formulario demo) y Yape (QR demo), incluyendo caso de pago rechazado.
- **Boleta**: vista tipo ticket, descarga en PDF y envío por WhatsApp.

> Los pagos y la boleta son **simulados**. Nada se cobra ni se envía a SUNAT.
> El PDF se comparte adjuntándolo con la Web Share API (móvil / navegadores compatibles);
> si no está disponible, se descarga el PDF y se abre WhatsApp con el mensaje listo.

## Requisitos

- Node.js 20 o superior
- npm
- Una base de datos PostgreSQL (Neon, Netlify DB o Postgres local)

## Puesta en marcha

```powershell
npm install
# Define DATABASE_URL en .env con tu cadena de Postgres
npm run db:deploy   # aplica migraciones
npm run db:seed     # carga datos de ejemplo (solo si la base está vacía)
npm run dev
```

Abre http://localhost:3000

## Despliegue en Netlify

El proyecto ya incluye `netlify.toml` y `scripts/netlify-build.mjs`. En el build se
ejecutan automáticamente las migraciones y la carga inicial de datos.

1. Conecta el repositorio en Netlify.
2. Configura la base de datos:
   - Opción A: activa **Netlify DB** (se usa `NETLIFY_DATABASE_URL`).
   - Opción B: crea un Postgres gratis (Neon/Supabase) y define `DATABASE_URL`
     (pooled) y `DIRECT_URL` (directa) en las variables de entorno del sitio.
3. Deploy. En el primer build se crean las tablas y se cargan los datos de ejemplo.

## Scripts útiles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:deploy` | Aplica las migraciones en la base |
| `npm run db:seed` | Carga datos de ejemplo (omite si ya hay datos) |
| `npm run db:studio` | Abre Prisma Studio para ver la base |

## Flujo de prueba sugerido

1. **POS** → busca "martillo", agrega productos al carrito.
2. Completa cliente y teléfono (para el envío por WhatsApp).
3. Elige **Efectivo** y cobra, o **Tarjeta/Yape** para ver la pasarela simulada.
   - En el modal puedes probar **"Simular pago rechazado"**.
4. Al confirmar, se abre la **boleta**: descarga el PDF y usa **Enviar por WhatsApp**.
5. En **Inventario**, registra una entrada de mercadería y revisa el **kardex**.
6. En **Productos**, crea un producto nuevo y edítalo.

## Estructura

```
prisma/          schema + seed de datos de ferretería
src/app/         páginas (dashboard, pos, productos, inventario, ventas) y API routes
src/components/  UI (sidebar, POS, boleta, formularios)
src/lib/         utilidades (dinero/IGV, tipos, PDF, validaciones, Prisma)
src/server/      lógica de negocio (productos, inventario, ventas, resumen)
```

## Notas

- Base de datos PostgreSQL (Neon / Netlify DB / local). En producción se aplican
  las migraciones en `prisma/migrations` durante el deploy.
- Montos manejados en céntimos para evitar errores de redondeo.
- Para cambiar los datos de la ferretería (nombre, RUC, IGV, serie) edita el modelo
  `Configuracion` en `prisma/schema.prisma` o desde Prisma Studio.
