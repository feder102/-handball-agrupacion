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

export const registerUser = async ({
  fullName,
  email,
  password,
  document,
  phone,
  role,
}: RegisterPayload): Promise<RegisterResponse> => {
  const trimmedEmail = email.trim().toLowerCase();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        full_name: fullName,
        document,
        phone,
        role,
      },
    },
  });

  if (signUpError) {
    return { status: "error", message: signUpError.message };
  }

  const userId = signUpData.user?.id;

  if (!userId) {
    return {
      status: "error",
      message: "No pudimos recuperar el identificador del usuario creado",
    };
  }

  if (!signUpData.session) {
    return {
      status: "success",
      requiresEmailConfirmation: true,
    };
  }

  // Si se dispone de un endpoint server-side que ejecute la RPC
  // (por ejemplo, una Supabase Edge Function usando la SERVICE_ROLE key),
  // llamamos a ese endpoint para crear/actualizar las filas sensibles
  // desde un contexto seguro. Esto evita exponer la service role key.
  const createUserEndpoint = import.meta.env.VITE_CREATE_USER_URL;

  if (createUserEndpoint) {
    try {
      const resp = await fetch(createUserEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName,
          document,
          email: trimmedEmail,
          phone,
          role,
        }),
        credentials: "omit",
      });

      const json = await resp.json();

      if (!resp.ok) {
        return { status: "error", message: json?.error || json?.message || "Error creating user on server" };
      }

      return { status: "success", requiresEmailConfirmation: false };
    } catch (err: any) {
      return { status: "error", message: err?.message ?? String(err) };
    }
  }

  // Fallback: si no hay endpoint server-side configurado, intentamos
  // realizar la inserción desde el cliente (esto puede fallar si las
  // políticas RLS lo impiden). Es preferible desplegar la función server-side
  // y configurar VITE_CREATE_USER_URL en el entorno.
  const { data: socioData, error: socioError } = await supabase
    .from("socios")
    .insert({
      nombre: fullName,
      documento: document,
      email: trimmedEmail,
      telefono: phone,
    })
    .select("id")
    .single();

  if (socioError) {
    return { status: "error", message: socioError.message };
  }

  const { error: userInsertError } = await supabase.from("usuarios").insert({
    id: userId,
    email: trimmedEmail,
    rol: role,
    socio_id: socioData.id,
  });

  if (userInsertError) {
    return { status: "error", message: userInsertError.message };
  }

  return {
    status: "success",
    requiresEmailConfirmation: false,
  };
};
