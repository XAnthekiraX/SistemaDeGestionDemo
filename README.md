# Sistema de Gestión Demo

Demo funcional del sistema de gestión de producción y envíos. Replica el frontend del proyecto original usando las mismas tecnologías, con un backend simulado (mock services) que persiste datos en `localStorage`.

## Stack

- **Frontend:** React 18 + TypeScript + Vite 6
- **Estilos:** Tailwind CSS v4
- **Estado global:** Zustand 5
- **Estado server:** TanStack Query 5
- **Formularios:** React Hook Form 7 + Zod 3
- **HTTP client:** Axios (mock adapter)

## Inicio rápido

```bash
npm install
npm run dev
```

El servidor de desarrollo arranca en `http://localhost:5173`.

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| admin | `admin@demo.com` | `admin123` |
| despacho | `despacho@demo.com` | `despacho123` |
| produccion | `produccion@demo.com` | `produccion123` |

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Métricas: productos, stock total, pedidos pendientes, clientes |
| **Productos** | CRUD completo con búsqueda y código de barras automático |
| **Clientes** | CRUD con validación de documento único |
| **Inventario** | Stock con ordenamiento, indicadores por nivel y agregar stock (escáner/manual) |
| **Envíos** | Crear, validar (escáner/manual), cancelar. Generación de PDF |
| **Movimientos** | Historial unificado de entradas y salidas con filtros por tipo y fecha |

## Estructura

```
src/
├── api/              # Axios mock adapter y endpoints
├── mock/             # Implementaciones mock y datos de prueba
├── store/            # Zustand (auth, UI)
├── hooks/            # useAuth, useFormPersist, useUserRole
├── types/            # Tipos TypeScript
├── components/
│   ├── ui/           # Button, Input, Select, Badge, Modal, Loader
│   ├── shared/       # EmptyState, ErrorState
│   └── layout/       # Header, Sidebar, PageContainer
├── pages/
│   ├── auth/         # LoginPage
│   ├── dashboard/    # DashboardPage
│   ├── customers/    # CustomersPage
│   ├── products/     # ProductsPage
│   ├── inventario/   # InventarioPage + InventarioAddStockPage
│   ├── movimientos/  # MovimientosPage
│   └── shipments/    # ShipmentsPage + Create + Validate
├── routes/           # AppRouter con guards por rol
├── providers/        # AuthProvider
├── utils/            # Generador de PDF
└── styles/           # globals.css (Tailwind)
```

## Permisos por rol

| Funcionalidad | admin | despacho | produccion |
|---------------|:-----:|:--------:|:----------:|
| Dashboard | Si | Si | No |
| Clientes (CRUD) | Si | No | No |
| Productos (CRUD) | Si | No | No |
| Inventario | Si | No | Si |
| Agregar Stock | Si | No | Si |
| Movimientos | Si | Si | No |
| Envíos | Si | Si | No |
| Validar Envío | Si | Si | No |

## Build

```bash
npm run build   # TypeScript + Vite
npm run preview # Preview del build
```
