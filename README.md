# E-Commerce Storefront (React SPA)

Aplicación Frontend Single Page Application (SPA) construida para consumir el ecosistema de microservicios de e-commerce a través del API Gateway. 

Este proyecto demuestra la integración entre un ecosistema Backend Cloud-Native (Spring Boot) y un cliente web moderno usando peticiones HTTP asíncronas.

## Stack Tecnológico "Golden Stack"
- **React 19:** Renderizado de interfaces reactivas basadas en componentes.
- **TypeScript:** Tipado estricto para evitar errores en tiempo de ejecución.
- **Vite:** Herramienta de construcción (Build Tool) de ultra-alta velocidad.
- **Tailwind CSS v4:** Framework de utilidades para diseño rápido y responsivo.
- **Axios:** Cliente HTTP basado en promesas para integrarse con el API Gateway.

## Arquitectura de Integración

El frontend está completamente desacoplado del backend. Todas las comunicaciones de red apuntan a un único punto de entrada:

- **API Gateway URL:** `http://localhost:8000`
- **Catálogo (GET):** `/api/products` (Enrutado internamente al Inventory API)
- **Compras (POST):** `/api/orders` (Enrutado internamente al Orders API)

> **Nota:** El API Gateway tiene configurado `globalcors` para permitir peticiones transversales (Cross-Origin) desde el servidor de desarrollo de Vite (Puerto `5173`).

## Instrucciones de Ejecución

1. Instalar dependencias de Node.js:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
3. Acceder en el navegador a `http://localhost:5173`
