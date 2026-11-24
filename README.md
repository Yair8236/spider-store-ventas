# Spider Store · Sistema de ventas

Registro de ventas, costos y proveedores para Spider Store (La Paz, Bolivia).
Funciona en navegador (PC, laptop y celular) y se instala como app desde el menú del navegador.

## Roles

| | Administrador | Vendedor |
|---|---|---|
| Registrar ventas y generar la nota (PDF / WhatsApp) | Si | Si |
| Registrar proveedores nuevos | Si | Si |
| Ver registros de ventas, garantias por N.º de serie, resumen | Si | **No** |
| Modificar ventas, precios, proveedores, costos, ajustes | Si | **No** |
| Aprobar / observar las ventas hechas por vendedores | Si | No |
| Crear cuentas, cambiar claves, activar o desactivar | Si | No |

Las ventas de un vendedor quedan **por aprobar** hasta que el administrador las revisa.
Los permisos se aplican en la base de datos (reglas RLS de Postgres), no solo en la pantalla.

## Piezas

- `index.html`, `css/`, `js/`, `vendor/pdf-lib.min.js`: la app (sin build, HTML + JS puro).
- `supabase/schema.sql`: tablas, reglas de seguridad y la funcion `registrar_venta`.
- `supabase/functions/admin-usuarios`: Edge Function para que el administrador cree cuentas.
- `js/config.js`: URL y llave *publishable* de Supabase (es publica por diseño).

## Publicar

GitHub Pages desde la rama `main`, carpeta raiz. No hay paso de compilacion.

## Base de datos nueva (otro proyecto de Supabase)

1. Ejecuta `supabase/schema.sql` en el SQL Editor (borra las tablas del esquema `public`).
2. Despliega la funcion `admin-usuarios` (`supabase functions deploy admin-usuarios --no-verify-jwt`).
3. Crea tu usuario en Authentication y agregalo a `perfiles` con rol `admin`.
4. Cambia `url` y `key` en `js/config.js`.
