# DevAll - Dependency Requirements

## Core Libraries (Dependencias de Producción)
- **React 19 & React-DOM**: Base del frontend. eto es solo para el diseño lo puedes quitar
- **Vite**: Herramienta de construcción y servidor de desarrollo.
- **Lucide-React**: Set de iconos (Wrench, Activity, etc.).
- **Recharts**: Para los gráficos dinámicos del dashboard BI.
- **React-Is**: Utilidad de compatibilidad para React.

## Dev Tools (Dependencias de Desarrollo)
- **TypeScript**: Para el tipado estático (archivos .ts y .tsx).
- **Tailwind CSS**: Framework de estilos.
- **PostCSS & Autoprefixer**: Para el procesamiento de CSS.
- **@vitejs/plugin-react**: Plugin oficial de Vite para React.
- **@types/**: Definiciones de tipos para React, ReactDOM y Node.

---

## Comandos de Instalación

```bash
npm install --legacy-peer-deps
```

```bash
# Core
npm install lucide-react react react-dom recharts vite

# Dev
npm install -D typescript @types/react @types/react-dom @types/node tailwindcss postcss autoprefixer @vitejs/plugin-react --legacy-peer-deps
```

> [!IMPORTANT]
> `--legacy-peer-deps` para evitar conflictos entre las versiones más recientes de Vite y React.
