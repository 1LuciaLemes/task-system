# AGENTS.md

Guía para agentes de IA que trabajen en el repositorio Task System.

## Proyecto

Monorepo TypeScript con npm workspaces:

- `backend/` — API REST (Node.js + Express + TypeScript): routes → controllers → services → repositories.
- `frontend/` — app web (React + TypeScript + Tailwind CSS, Vite).
- `docs/` — requisitos, arquitectura y registro de uso de IA.

## Comandos (desde la raíz)

- `npm install` — instala dependencias de ambos workspaces.
- `npm run dev -w task-system-backend` — API local en http://localhost:3000.
- `npm run dev -w task-system-frontend` — frontend local en http://localhost:5173.
- `npm run build` — compila backend y frontend.
- `npm test` — tests de backend y frontend.
- `docker compose up` — todo en contenedores (frontend :8080, backend :3000, postgres :5432).

## Convenciones

- Identificadores, carpetas y archivos en inglés; UI y docs en español.
- No agregar comentarios al código.
- Backend: respetar la separación de capas y validar en services.
- Persistencia: en memoria por defecto; con `DATABASE_URL` usa PostgreSQL.
- `estimate` es la estimación de esfuerzo opcional en horas; el sistema
  muestra el resumen de esfuerzo por estado considerando la jerarquía.
- Mantener `docs/*.md` alineados con el código.

## Git

- No commitear ni pushear sin pedido explícito.
- Mensajes de commit con prefijo convencional en español: `feat:`, `fix:`, `docs:`, `refactor:`.