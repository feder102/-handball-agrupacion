import { supabase } from "@/lib/supabase";

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  document: string;
  phone?: string;
  role: "admin" | "contador" | "operador" | "socio";
};

export type RegisterResponse =
  | { status: "success"; requiresEmailConfirmation: boolean }
  | { status: "error"; message: string };

/**
 * Registra un nuevo usuario utilizando Supabase Auth.
 * 
 * El trigger automático en la base de datos (handle_new_user) se encarga de:
 * 1. Extraer los datos de raw_user_meta_data
 * 2. Crear automáticamente el registro en public.usuarios (1:1 con auth.users)
 * 3. Validar documento único y asignar el rol correspondiente
 * 
 * Flujo:
 * - Cliente llama registerUser() -> supabase.auth.signUp()
 * - Supabase crea usuario en auth.users
 * - Trigger automático crea fila en public.usuarios
 * - Usuario listo para usar la aplicación
 */
export const registerUser = async ({
  fullName,
  email,
  password,
  document,
  phone,
  role,
}: RegisterPayload): Promise<RegisterResponse> => {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedDocument = document.trim();
  const trimmedPhone = phone?.trim();

  // Validación básica cliente-side
  if (!trimmedDocument) {
    return {
      status: "error",
      message: "El documento es obligatorio",
    };
  }

  if (trimmedDocument.length < 6) {
    return {
      status: "error",
      message: "El documento debe tener al menos 6 caracteres",
    };
  }

  // Crear usuario en Supabase Auth con metadata
  // El trigger handle_new_user() procesará automáticamente estos datos
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        // Datos que el trigger extraerá de raw_user_meta_data
        documento: trimmedDocument,
        nombre: fullName,
        telefono: trimmedPhone || null,
        rol: role,
      },
    },
  });

  if (signUpError) {
    return { status: "error", message: signUpError.message };
  }

  if (!signUpData.user?.id) {
    return {
      status: "error",
      message: "No se pudo crear el usuario. Intentá nuevamente.",
    };
  }

  // Si el signup requiere confirmación de email (configuración de Supabase)
  // el trigger ya habrá creado la fila en public.usuarios
  if (!signUpData.session) {
    return {
      status: "success",
      requiresEmailConfirmation: true,
    };
  }

  // Usuario creado exitosamente con sesión activa
  // El trigger ya creó automáticamente el registro en public.usuarios
  return {
    status: "success",
    requiresEmailConfirmation: false,
  };
};
