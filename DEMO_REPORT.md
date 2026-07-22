# DEMO_REPORT.md — Rey Paletas Demo

## Información General

| Campo | Valor |
|-------|-------|
| **Proyecto original** | Rey Paletas Producción |
| **Carpeta demo** | `Rey_Paletas_Demo/` |
| **Frontend** | React 18 + TypeScript + Vite 6 |
| **Backend simulado** | Mock services con localStorage |
| **Estilos** | Tailwind CSS v4 |
| **Estado global** | Zustand 5 |
| **Estado server** | TanStack Query 5 |
| **Formularios** | React Hook Form 7 + Zod 3 |
| **HTTP client** | Axios (mock adapter) |

---

## Credenciales de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **admin** | `admin@reypaletas.com` | `admin123` | CRUD completo de todos los módulos |
| **despacho** | `despacho@reypaletas.com` | `despacho123` | Lectura de clientes/productos, CRUD de envíos, validación |
| **producción** | `produccion@reypaletas.com` | `produccion123` | Lectura de productos, CRUD de inventario (agregar stock) |

---

## Funcionalidades Simuladas

### Autenticación
- Login con email/password
- JWT simulado (token fake en localStorage)
- Persistencia de sesión entre recargas
- Cierre de sesión
- Redirección por rol al iniciar sesión

### Productos (CRUD)
- Listar productos con búsqueda por nombre/código
- Crear producto (genera código de barras automático)
- Editar nombre de producto
- Eliminar producto
- Paginación client-side (10 por página)

### Clientes (CRUD)
- Listar clientes con búsqueda por nombre/documento
- Crear cliente con validación de documento único
- Editar cliente
- Eliminar cliente
- Paginación client-side (10 por página)

### Inventario
- Listar stock con ordenamiento (cantidad, fecha)
- Indicadores de color por nivel de stock (rojo <15, amarillo <90, verde ≥90)
- Agregar stock con modo escáner y modo manual
- Ajuste de stock con +/- (solo admin)
- Persistencia de formulario de borrador en localStorage

### Envíos
- Listar envíos con filtro por estado y búsqueda por cliente
- Crear envío (seleccionar cliente → agregar productos → enviar)
- Validación de stock antes de crear envío
- Validación de envío con escáner de productos
- Comparación visual de esperado vs escaneado
- Generación de PDF del pedido
- Cancelación de envío (devuelve stock si estaba confirmado)
- Estados: por confirmar → confirmado / cancelado

### Movimientos
- Historial unificado de entradas (stock) y salidas (envíos)
- Filtros por tipo (entrada/salida) y fecha
- Filas expandibles con detalle de productos

### Dashboard
- Métricas: total productos, stock total, pedidos pendientes, total clientes

### Navegación
- Sidebar dinámico según rol
- Menú responsive (desktop collapsible, mobile slide-in)
- Rutas protegidas por autenticación y rol

---

## Lo que NO se Puede Simular (Requiere Backend Real)

### 1. Autenticación Real con Supabase Auth
- **Endpoint:** `POST /public/login` con Supabase `signInWithPassword`
- **Problema:** La demo usa tokens fake; no valida credenciales reales ni maneja sesiones reales de Supabase
- **Solución:** Conectar al backend real para autenticación
- **Prioridad:** Alta
- **Esfuerzo:** Mínimo (ya existe el backend)

### 2. Generación de Barcode con bwip-js
- **Endpoint:** `POST /private/products` → llama RPC `crear_producto` + genera imagen Code128
- **Problema:** La demo genera códigos de texto pero no genera imágenes de código de barras reales
- **Solución:** Implementar generación de barcode en el frontend o conectar al backend
- **Prioridad:** Media
- **Esfuerzo:** Medio (instalar librería barcode en frontend)

### 3. Subida de Barcode a Supabase Storage
- **Endpoint:** `POST /private/products` → sube imagen a bucket `Barcode`
- **Problema:** Sin backend real, no hay almacenamiento de imágenes de barcode
- **Solución:** Conectar al backend real o usar Storage de Supabase directamente
- **Prioridad:** Media
- **Esfuerzo:** Bajo (requiere credenciales de Supabase)

### 4. RPC Functions de PostgreSQL
- `crear_producto(nombre)` — genera barcode único en DB
- `agregar_inventario(items, origin, notes)` — crea stock_entry + upsert inventory
- `validate_shipment(shipment_id, items)` — valida y descuenta stock atómicamente
- `cancel_shipment(shipment_id)` — cancela y devuelve stock
- **Problema:** La demo simula estas funciones en JavaScript, pero no garantiza atomicidad ni integridad referencial
- **Solución:** Conectar al backend real con Supabase
- **Prioridad:** Alta
- **Esfuerzo:** Mínimo (ya existe el backend)

### 5. Row Level Security (RLS)
- **Problema:** La demo no tiene RLS; cualquier usuario podría teóricamente acceder a todos los datos si manipula el código
- **Solución:** Conectar al backend real que usa Supabase Admin client con RLS
- **Prioridad:** Alta
- **Esfuerzo:** Mínimo (ya existe el backend)

### 6. Refresh Token Real
- **Endpoint:** `POST /private/auth/refresh-token`
- **Problema:** La demo simula refresh con tokens fake
- **Solución:** Conectar al backend real
- **Prioridad:** Alta
- **Esfuerzo:** Mínimo

### 7. Búsqueda de Clientes en Backend
- **Endpoint:** `GET /private/customers?search=...`
- **Problema:** La demo filtra en cliente, pero el backend real usa `ILIKE` de PostgreSQL
- **Solución:** Conectar al backend real para búsqueda server-side
- **Prioridad:** Baja
- **Esfuerzo:** Bajo

### 8. Búsqueda de Envíos por Cliente
- **Endpoint:** `GET /private/shipments?search=...`
- **Problema:** La demo solo filtra por nombre de destino, el backend real busca por nombre/documento del cliente en la tabla customers
- **Solución:** Conectar al backend real
- **Prioridad:** Baja
- **Esfuerzo:** Bajo

---

## Datos Incluidos en la Demo

### Productos (12)
Paleta de Mango, Fresa, Coco, Limón, Guanábana, Maracuyá, Tamarindo, Sandía, Piña, Mora, Naranja, Cereza

### Clientes (10)
Almacenes Éxito, Supermarket Carulla, Distribuciones La Torre, Tiendas Ara, Oxxo Colombia, Éxito Express, Metro de Medellín, Almacenes Olímpica, Farmatodo, D1 Minorista

### Inventario
Stock variado por producto (8 a 200 unidades), con algunos productos en nivel crítico (<15)

### Envíos (6)
- 2 en estado "por confirmar"
- 3 en estado "confirmado"
- 1 en estado "cancelado"

### Movimientos
Historial combinado de entradas de stock y salidas por envío

---

## Cómo Ejecutar la Demo

```bash
cd Rey_Paletas_Demo
npm install
npm run dev
```

El servidor de desarrollo arranca en `http://localhost:5173`.

---

## Estructura de la Demo

```
Rey_Paletas_Demo/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── src/
│   ├── api/
│   │   ├── client.ts          ← Axios mock adapter
│   │   └── endpoints.ts       ← API functions (idénticas al original)
│   ├── mock/
│   │   ├── api.ts             ← Mock implementations
│   │   └── data.ts            ← Mock data (12 productos, 10 clientes, etc.)
│   ├── store/
│   │   ├── auth.store.ts      ← Zustand auth (idéntico al original)
│   │   └── ui.store.ts        ← Zustand UI (idéntico al original)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFormPersist.ts
│   │   └── useUserRole.ts
│   ├── types/                 ← Todos los tipos (idénticos al original)
│   ├── components/
│   │   ├── ui/                ← Button, Input, Select, Badge, Modal, Loader
│   │   ├── shared/            ← EmptyState, ErrorState
│   │   └── layout/            ← Header, Sidebar, PageContainer
│   ├── pages/
│   │   ├── auth/LoginPage.tsx
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── customers/CustomersPage.tsx
│   │   ├── products/ProductsPage.tsx
│   │   ├── inventario/       ← InventarioPage + InventarioAddStockPage
│   │   ├── movimientos/MovimientosPage.tsx
│   │   └── shipments/        ← ShipmentsPage + Create + Validate
│   ├── routes/
│   │   ├── AppRouter.tsx      ← Todas las rutas con guards
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── providers/AuthProvider.tsx
│   ├── utils/pdfGenerator.ts
│   ├── styles/globals.css
│   ├── App.tsx
│   └── main.tsx
└── DEMO_REPORT.md
```

---

## Conclusión

La demo replica fielmente la experiencia de usuario del sistema Rey Paletas usando las **mismas tecnologías** del proyecto original. Todos los flujos principales funcionan de forma independiente del backend. Las limitaciones son exclusivamente de seguridad (RLS, tokens reales) e integridad de datos (atomicidad de transacciones), que se resuelven conectando al backend real de Supabase.
