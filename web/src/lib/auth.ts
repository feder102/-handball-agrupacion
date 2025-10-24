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
  // If a server-side endpoint is configured to run the RPC (e.g. a
  // Supabase Edge Function using the SERVICE_ROLE key), call it from
  // a secure context to create/update sensitive rows. We call it
  // immediately after obtaining the auth user id so the profile is
  // created even when the user must confirm their email.
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

      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        return { status: "error", message: json?.error || json?.message || "Error creating user on server" };
      }
      // continue — we created the profile on the server. Response
      // handling below will decide the correct return shape
    } catch (err: any) {
      return { status: "error", message: err?.message ?? String(err) };
    }
  }

  // If the sign up didn't create an immediate session (e.g. requires
  // email confirmation), still return requiresEmailConfirmation=true
  // but the server-side profile was already created above.
  if (!signUpData.session) {
    return {
      status: "success",
      requiresEmailConfirmation: true,
    };
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
