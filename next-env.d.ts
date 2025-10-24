/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: agregar tipos de entorno útiles
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
  }
}

export {};
