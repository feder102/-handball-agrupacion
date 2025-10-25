-- ====================================
-- Script de Prueba: Trigger handle_new_user
-- ====================================
-- Este script te permite probar el trigger de registro automático
-- directamente desde el SQL Editor de Supabase.
--
-- IMPORTANTE: Ejecutá estas queries UNA POR UNA, no todas juntas.
-- ====================================

-- 1) Verificar que el trigger existe
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Esperado: Debe aparecer una fila con el trigger 'on_auth_user_created'


-- 2) Verificar que la función existe
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Esperado: Debe aparecer 'handle_new_user' con is_security_definer = true


-- 3) Verificar roles disponibles
SELECT id, nombre, descripcion 
FROM public.roles 
ORDER BY id;

-- Esperado: Deberías ver los 4 roles: admin, contador, operador, socio


-- 4) Crear un usuario de prueba manualmente (simula el signup)
-- IMPORTANTE: Reemplazá el email con uno único cada vez que pruebes
-- El trigger debería crear automáticamente el registro en public.usuarios

-- Nota: Esta query requiere privilegios de superuser/service_role
-- Ejecutala desde el SQL Editor de Supabase (que tiene estos privilegios)

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test-usuario-' || floor(random() * 10000) || '@example.com', -- Email único
  crypt('password123', gen_salt('bf')), -- Contraseña hasheada
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"documento":"12345678","nombre":"Usuario de Prueba","telefono":"+5491123456789","rol":"socio"}', -- ← El trigger lee esto
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Si el trigger funciona correctamente, NO deberías ver ningún error
-- y el usuario debería aparecer automáticamente en public.usuarios


-- 5) Verificar que el usuario se creó en public.usuarios
SELECT 
  u.id,
  u.documento,
  u.email,
  u.nombre,
  u.telefono,
  r.nombre as rol,
  u.activo,
  u.creado_en
FROM public.usuarios u
JOIN public.roles r ON r.id = u.rol_id
ORDER BY u.creado_en DESC
LIMIT 5;

-- Esperado: Deberías ver el usuario recién creado con los datos del raw_user_meta_data


-- 6) Verificar que el id coincide entre auth.users y public.usuarios
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  pu.id as public_id,
  pu.email as public_email,
  pu.documento,
  pu.nombre,
  r.nombre as rol
FROM auth.users au
LEFT JOIN public.usuarios pu ON au.id = pu.id
LEFT JOIN public.roles r ON r.id = pu.rol_id
WHERE au.email LIKE 'test-usuario-%@example.com'
ORDER BY au.created_at DESC
LIMIT 5;

-- Esperado: auth_id y public_id deben ser idénticos (UUID igual)
-- Si public_id es NULL, significa que el trigger falló


-- 7) Limpiar usuarios de prueba (opcional)
-- CUIDADO: Esto elimina TODOS los usuarios de prueba que creaste
-- Solo ejecutá esto si estás seguro

DELETE FROM auth.users 
WHERE email LIKE 'test-usuario-%@example.com';

-- Como public.usuarios tiene ON DELETE CASCADE, también se eliminará de allí


-- ====================================
-- Pruebas de Casos Especiales
-- ====================================

-- 8) Probar con documento vacío (debería fallar)
-- Descomentá las siguientes líneas para probar:
/*
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, 
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated',
  'sin-documento@example.com',
  crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Sin Documento"}', -- ← Falta documento
  now(), now(), '', '', '', ''
);
*/
-- Esperado: ERROR con mensaje "El documento es obligatorio"


-- 9) Probar con rol inválido (debería usar 'socio' por defecto)
-- Descomentá las siguientes líneas para probar:
/*
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, 
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, 
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated',
  'rol-invalido@example.com',
  crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"documento":"99999999","nombre":"Rol Inválido","rol":"super_admin"}', -- ← Rol no existe
  now(), now(), '', '', '', ''
);

-- Luego verificá el rol asignado:
SELECT u.email, r.nombre as rol
FROM public.usuarios u
JOIN public.roles r ON r.id = u.rol_id
WHERE u.email = 'rol-invalido@example.com';
*/
-- Esperado: Debería tener rol 'socio' (default)


-- 10) Ver logs de warnings (si hay errores silenciados)
-- Esta query solo funciona si tenés acceso a pg_stat_statements
/*
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%handle_new_user%'
ORDER BY total_exec_time DESC
LIMIT 10;
*/


-- ====================================
-- ✅ Checklist de Verificación
-- ====================================
-- [ ] El trigger 'on_auth_user_created' existe y está habilitado
-- [ ] La función 'handle_new_user' existe con security definer
-- [ ] Los 4 roles (admin, contador, operador, socio) existen
-- [ ] Al insertar en auth.users, se crea automáticamente en public.usuarios
-- [ ] El id es el mismo en ambas tablas (relación 1:1)
-- [ ] Documento vacío genera error
-- [ ] Rol inválido usa 'socio' por defecto
-- [ ] Documento duplicado genera warning pero no falla el signup

-- ====================================
-- 🎉 Si todas las pruebas pasan, el trigger funciona correctamente!
-- ====================================
