# 🏠 Rentix 2026 - Backend API

**Rentix** es un ecosistema ERP de gestión patrimonial de alta disponibilidad, diseñado bajo el estándar **Blueprint 2026**. El núcleo del sistema está optimizado para el cumplimiento normativo de **Veri*factu (AEAT)** y la gestión multi-tenant de activos inmobiliarios.



## 🚀 Pilares de la Arquitectura

### 1. Blindaje Total (Security & Multi-tenancy)
* **Context Overriding**: Seguridad de nivel bancario. El `companyId` se extrae estrictamente del JWT y se inyecta en la capa de servicio. No se confía en los IDs enviados por el cliente.
* **Jerarquía de Roles Estricta**:
    * **App Level**: `SUPERADMIN` (Control total), `ADMIN` (Gestión técnica), `USER` (Base).
    * **Company Level**: `OWNER` (Dueño del patrimonio), `TENANT` (Arrendatario), `VIEWER` (Gestor con herencia de permisos).
* **Integridad Atómica**: Procesos de creación compleja (Contrato + Inmueble + Inquilino) gestionados como una única transacción de base de datos.

### 2. Veri*factu & Fiscalidad Española
* **Tax Engine**: Catálogo impositivo dinámico (IVA/IRPF) con validación obligatoria de causas de exención para cumplimiento de la Ley 11/2021 (Antifraude).
* **Contract Engine**: Generador de devengos automatizado con soporte nativo para múltiples métodos de pago (Bizum, SEPA, Tarjeta, Ingreso).

### 3. Sincronización Contract-First (Frontend-Backend)
* **OpenAPI 3.0**: Documentación técnica autogenerada y tipada.
* **Zero-DRY**: Sincronización automática de modelos mediante `ng-openapi-gen`, garantizando que el contrato de datos sea idéntico en Angular y NestJS.

---

## 🛠️ Stack Tecnológico
* **Core**: [NestJS](https://nestjs.com/) v10+ (TypeScript Strict Mode).
* **Persistencia**: [TypeORM](https://typeorm.io/) + PostgreSQL.
* **Documentación**: [Swagger/OpenAPI](https://swagger.io/).
* **Estándar de Código**: JSDoc 2026 & Conventional Commits.

---

## 📋 Módulos Core Implementados

| Módulo | Descripción | Estado |
| :--- | :--- | :--- |
| **Auth** | Seguridad JWT, Guards de Rol y Decoradores de Usuario. | ✅ |
| **Company** | Configuración del Arrendador y Blindaje Patrimonial. | ✅ |
| **Property** | Gestión de Inmuebles, Referencia Catastral y Estados. | ✅ |
| **Tax** | Catálogo fiscal compatible con FacturaE 3.2.x. | ✅ |
| **Tenant** | Perfilado de Arrendatarios y validación fiscal. | ✅ |
| **Contract** | Gestión de alquileres, periodos e impuestos. | ✅ |

---

## ⚙️ Sincronización con el Frontend

Para actualizar el SDK del frontend tras cambios en el API, ejecuta desde la raíz del proyecto Angular:

```bash
npx ng-openapi-gen -i http://localhost:3000/api-json -o src/app/api




🧪 Comandos de Desarrollo
# Instalación de dependencias
$ npm install

# Desarrollo con Hot Reload
$ npm run start:dev

# Producción
$ npm run build


Aviso de Cumplimiento: Este software ha sido desarrollado siguiendo las directrices de integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad de los registros de facturación exigidos por la AEAT.