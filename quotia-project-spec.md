# Quotia — Cotizador/Propuestas Automatizado (Proyecto DesarroJoss)

> Primer proyecto 100% personal de DesarroJoss. Objetivo: MVP funcional y shippeable en ~3-4 fines
> de semana (código pesado solo viernes-domingo), para portafolio y como herramienta real de cierre
> de clientes de DesarroJoss.

## 1. Qué resuelve

Un pequeño negocio o freelancer llena un formulario con los datos de una cotización/propuesta
(cliente, ítems, precios, condiciones), el sistema genera automáticamente un PDF profesional,
permite enviarlo y cobrarlo (Stripe), y deja todo registrado en un panel simple para hacer
seguimiento del estado (enviada, vista, pagada).

## 2. Alcance del MVP (v1 — no salirse de esto)

1. **Formulario de creación de cotización**: datos del cliente, lista de ítems (descripción,
   cantidad, precio unitario), cálculo automático de subtotal/impuestos/total, condiciones/notas.
2. **Generación de PDF**: cotización con diseño limpio y profesional, descargable.
3. **Cobro con Stripe**: link de pago asociado a la cotización (Stripe Checkout, modo simple).
4. **Panel simple**: lista de cotizaciones creadas con su estado (borrador / enviada / pagada),
   acceso protegido solo para el dueño (autenticación básica de un solo usuario).

**Fuera de alcance para v1** (dejar para v2, no implementar ahora):
- Recordatorios automáticos de seguimiento.
- Plantillas de cotización por industria.
- Soporte multi-moneda.
- Analítica de conversión (qué cotizaciones se abren, tasa de cierre, etc.).

## 3. Stack técnico decidido

- **Frontend**: Next.js + TypeScript, desplegado en **Vercel**.
- **Backend**: API routes / server actions del mismo proyecto Next.js (sin backend separado, para
  simplificar el despliegue en Vercel).
- **Base de datos**: **Firebase** (Firestore) — plan gratuito.
- **Autenticación**: Firebase Auth (un solo usuario administrador, sin registro público).
- **Pagos**: Stripe (modo test primero, Checkout Sessions).
- **Generación de PDF**: librería a definir por Claude Code (ej. `@react-pdf/renderer` o `pdf-lib`)
  según lo que mejor se integre con Next.js/Vercel (entorno serverless, sin dependencias nativas
  pesadas).
- **Estilo visual**: coherente con la identidad de marca DesarroJoss (tema oscuro, acento cian,
  tipografía monoespaciada para acentos) — aunque el PDF de cotización en sí puede tener un diseño
  más neutro/profesional pensado para el cliente final del usuario, no para la marca DesarroJoss.

## 4. Modelo de datos (borrador, ajustar según lo que Claude Code proponga)

**Quote (cotización)**
- id
- cliente: { nombre, correo, empresa (opcional) }
- items: [{ descripción, cantidad, precioUnitario }]
- subtotal, impuestos, total
- condiciones/notas (texto libre)
- estado: "borrador" | "enviada" | "pagada"
- fechaCreación
- stripeCheckoutUrl (una vez generado el link de pago)

## 5. Timeline sugerido (bloques de fin de semana)

- **Fin de semana 1**: scaffolding del proyecto, formulario de creación de cotización, cálculo de
  totales, guardado en Firestore.
- **Fin de semana 2**: generación de PDF a partir de los datos de la cotización.
- **Fin de semana 3**: integración de Stripe (Checkout Session ligada a la cotización).
- **Fin de semana 4**: panel de listado/estado de cotizaciones, autenticación de un solo usuario,
  pulido general y despliegue final en Vercel.

## 6. Notas para Claude Code

- Priorizar simplicidad de despliegue: todo en un solo proyecto Next.js si es posible, para que
  Vercel maneje frontend + backend sin infraestructura adicional.
- Firestore en el plan gratuito tiene límites de lecturas/escrituras — no es un problema para un
  MVP de un solo usuario, pero evitar patrones de queries ineficientes desde el inicio.
- Empezar por el flujo completo con datos de prueba (mock) antes de conectar Stripe en modo real.
