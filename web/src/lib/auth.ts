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
