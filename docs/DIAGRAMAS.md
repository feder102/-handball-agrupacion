# 🎨 Diagramas del Sistema de Registro Automático

## 📊 Diagrama de Flujo Completo

```mermaid
graph TD
    A[Usuario abre /register] --> B[Completa formulario]
    B --> C{Validación<br/>frontend}
    C -->|Inválido| D[Muestra errores]
    D --> B
    C -->|Válido| E[supabase.auth.signUp<br/>options.data: documento, nombre, telefono, rol]
    E --> F[Supabase Auth<br/>valida email único]
    F -->|Email duplicado| G[Error: User already registered]
    G --> H[Muestra mensaje de error]
    F -->|Email OK| I[Crea usuario en auth.users<br/>con raw_user_meta_data]
    I --> J[Trigger: on_auth_user_created]
    J --> K[Función: handle_new_user]
    K --> L{Extrae<br/>raw_user_meta_data}
    L --> M{Documento<br/>presente?}
    M -->|No| N[Exception: documento obligatorio]
    N --> O[Signup falla]
    M -->|Sí| P{Documento<br/>único?}
    P -->|Duplicado| Q[Warning: documento duplicado<br/>continúa sin crear perfil]
    Q --> R[Usuario en auth.users<br/>SIN perfil en public.usuarios]
    P -->|Único| S{Rol<br/>válido?}
    S -->|No| T[Usa rol 'socio' default]
    S -->|Sí| U[Usa rol especificado]
    T --> V[INSERT INTO public.usuarios]
    U --> V
    V --> W{Requiere<br/>confirmación<br/>email?}
    W -->|Sí| X[Usuario creado<br/>debe confirmar email]
    W -->|No| Y[Usuario creado<br/>sesión activa]
    X --> Z[Muestra mensaje:<br/>Revisá tu correo]
    Y --> AA[Muestra mensaje:<br/>Cuenta creada exitosamente]
    AA --> AB[Redirige a /]
    Z --> AC[Usuario confirma email]
    AC --> AB

    style E fill:#10b981,stroke:#059669,color:#fff
    style I fill:#3b82f6,stroke:#2563eb,color:#fff
    style V fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style AA fill:#22c55e,stroke:#16a34a,color:#fff
    style N fill:#ef4444,stroke:#dc2626,color:#fff
    style Q fill:#f59e0b,stroke:#d97706,color:#000
```

## 🔄 Diagrama de Secuencia Detallado

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario
    participant F as Frontend<br/>(Register.tsx)
    participant A as auth.ts<br/>(registerUser)
    participant SA as Supabase Auth
    participant T as Trigger<br/>(handle_new_user)
    participant DB as PostgreSQL
    
    U->>F: Completa formulario
    F->>F: Validación frontend<br/>(email, password, documento)
    F->>A: registerUser(email, password, documento, ...)
    
    Note over A: Prepara metadata
    A->>SA: signUp({ email, password,<br/>options: { data: {documento, nombre, ...} } })
    
    Note over SA: Valida email único
    alt Email duplicado
        SA-->>A: Error: User already registered
        A-->>F: { status: "error", message: ... }
        F-->>U: ❌ Muestra error
    else Email OK
        SA->>DB: INSERT INTO auth.users<br/>(id, email, raw_user_meta_data, ...)
        DB->>T: TRIGGER AFTER INSERT
        
        Note over T: Extrae raw_user_meta_data
        T->>T: v_documento := raw_user_meta_data->>'documento'
        T->>T: v_nombre := raw_user_meta_data->>'nombre'
        T->>T: v_telefono := raw_user_meta_data->>'telefono'
        T->>T: v_rol_nombre := raw_user_meta_data->>'rol'
        
        alt Documento vacío
            T-->>DB: EXCEPTION: documento obligatorio
            DB-->>SA: ❌ Error
            SA-->>A: Error
            A-->>F: { status: "error", message: ... }
            F-->>U: ❌ Muestra error
        else Documento presente
            T->>DB: SELECT id FROM roles WHERE nombre = v_rol_nombre
            
            alt Rol existe
                DB-->>T: rol_id encontrado
            else Rol no existe
                DB-->>T: NULL
                T->>T: Usa rol_id de 'socio'
            end
            
            T->>DB: INSERT INTO public.usuarios<br/>(id, documento, email, nombre, ...)
            
            alt Documento único
                DB-->>T: ✅ Insert exitoso
                T-->>DB: RETURN new
                DB-->>SA: ✅ Usuario + perfil creados
            else Documento duplicado
                DB-->>T: ⚠️ UNIQUE_VIOLATION
                T->>T: RAISE WARNING
                T-->>DB: RETURN new (signup continúa)
                DB-->>SA: ⚠️ Usuario creado (sin perfil)
            end
            
            SA-->>A: { user, session }
            
            alt Session existe
                A-->>F: { status: "success",<br/>requiresEmailConfirmation: false }
                F-->>U: ✅ Cuenta creada<br/>Redirigiendo...
                F->>F: navigate('/')
            else Session NULL (requiere confirmación)
                A-->>F: { status: "success",<br/>requiresEmailConfirmation: true }
                F-->>U: ✅ Revisá tu correo<br/>para confirmar
            end
        end
    end
```

## 🗄️ Diagrama de Base de Datos (Relaciones)

```mermaid
erDiagram
    AUTH_USERS ||--|| USUARIOS : "1:1 (mismo id)"
    ROLES ||--o{ USUARIOS : "rol_id"
    USUARIOS ||--o{ CUOTAS_USUARIOS : "usuario_id"
    USUARIOS ||--o{ PAGOS : "usuario_id"
    PERIODOS ||--o{ CUOTAS_USUARIOS : "periodo_id"
    PERIODOS ||--o{ PAGOS : "periodo_id"
    USUARIOS ||--o{ AUDITORIA : "actor"

    AUTH_USERS {
        uuid id PK
        text email UK
        jsonb raw_user_meta_data
        timestamp created_at
    }

    USUARIOS {
        uuid id PK,FK
        text documento UK
        text email UK
        text nombre
        text telefono
        smallint rol_id FK
        boolean activo
        timestamp creado_en
    }

    ROLES {
        smallint id PK
        text nombre UK
        text descripcion
    }

    PERIODOS {
        uuid id PK
        smallint mes
        integer anio
        numeric importe
    }

    CUOTAS_USUARIOS {
        uuid id PK
        uuid usuario_id FK
        uuid periodo_id FK
        text periodo
        numeric importe
        text estado
        date vencimiento
    }

    PAGOS {
        uuid id PK
        uuid usuario_id FK
        uuid periodo_id FK
        text periodo
        numeric monto
        text metodo
        text referencia UK
    }

    AUDITORIA {
        bigint id PK
        uuid actor FK
        text accion
        text entidad
        uuid entidad_id
        jsonb datos
    }
```

## 🏗️ Diagrama de Arquitectura del Sistema

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (Vite + React)"]
        UI[Register.tsx]
        AUTH[auth.ts]
        SUPABASE[supabase.ts<br/>Client]
    end

    subgraph Supabase["☁️ Supabase Backend"]
        SAUTH[Auth Service]
        REALTIME[Realtime]
        STORAGE[Storage]
    end

    subgraph Database["🗄️ PostgreSQL"]
        AUTHUSERS[(auth.users)]
        TRIGGER[Trigger:<br/>on_auth_user_created]
        FUNCTION[Function:<br/>handle_new_user]
        USUARIOS[(public.usuarios)]
        ROLES[(public.roles)]
        PERIODOS[(public.periodos)]
        CUOTAS[(public.cuotas_usuarios)]
        PAGOS[(public.pagos)]
        AUDITORIA[(public.auditoria)]
        RLS[RLS Policies]
    end

    UI --> AUTH
    AUTH --> SUPABASE
    SUPABASE --> SAUTH
    SAUTH --> AUTHUSERS
    AUTHUSERS --> TRIGGER
    TRIGGER --> FUNCTION
    FUNCTION --> ROLES
    FUNCTION --> USUARIOS
    RLS -.controla acceso.-> USUARIOS
    RLS -.controla acceso.-> CUOTAS
    RLS -.controla acceso.-> PAGOS
    RLS -.controla acceso.-> AUDITORIA
    USUARIOS --> CUOTAS
    USUARIOS --> PAGOS
    USUARIOS --> AUDITORIA
    PERIODOS --> CUOTAS
    PERIODOS --> PAGOS
    ROLES --> USUARIOS

    REALTIME -.sincroniza.-> USUARIOS
    REALTIME -.sincroniza.-> CUOTAS
    REALTIME -.sincroniza.-> PAGOS

    style TRIGGER fill:#10b981,stroke:#059669,color:#fff
    style FUNCTION fill:#3b82f6,stroke:#2563eb,color:#fff
    style AUTHUSERS fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style USUARIOS fill:#f59e0b,stroke:#d97706,color:#000
    style RLS fill:#ef4444,stroke:#dc2626,color:#fff
```

## 🔐 Diagrama de Seguridad y RLS

```mermaid
graph TD
    subgraph Roles["👥 Roles del Sistema"]
        ADMIN[Admin<br/>Acceso total]
        CONTADOR[Contador<br/>Reportes + Pagos]
        OPERADOR[Operador<br/>Gestión operativa]
        SOCIO[Socio<br/>Datos propios]
    end

    subgraph Policies["🛡️ RLS Policies"]
        P1[usuarios_select_self<br/>Usuario lee su registro]
        P2[usuarios_update_self<br/>Usuario actualiza su registro]
        P3[usuarios_select_admin<br/>Admin/Contador/Operador<br/>leen todos]
        P4[usuarios_insert_admin<br/>Solo Admin inserta]
        P5[usuarios_update_admin<br/>Solo Admin actualiza todos]
        
        P6[cuotas_read_self_or_admin<br/>Usuario lee sus cuotas<br/>o roles elevados todas]
        P7[cuotas_insert_admin<br/>Admin/Contador/Operador<br/>crean cuotas]
        
        P8[pagos_read_self_or_admin<br/>Usuario lee sus pagos<br/>o roles elevados todos]
        P9[pagos_insert_self_or_admin<br/>Usuario registra su pago<br/>o roles elevados]
    end

    subgraph Tables["📊 Tablas"]
        TU[public.usuarios]
        TC[public.cuotas_usuarios]
        TP[public.pagos]
        TA[public.auditoria]
    end

    ADMIN --> P3
    ADMIN --> P4
    ADMIN --> P5
    ADMIN --> P7
    ADMIN --> P8
    ADMIN --> P9
    
    CONTADOR --> P3
    CONTADOR --> P7
    CONTADOR --> P8
    CONTADOR --> P9
    
    OPERADOR --> P3
    OPERADOR --> P7
    OPERADOR --> P8
    OPERADOR --> P9
    
    SOCIO --> P1
    SOCIO --> P2
    SOCIO --> P6
    SOCIO --> P8
    SOCIO --> P9
    
    P1 --> TU
    P2 --> TU
    P3 --> TU
    P4 --> TU
    P5 --> TU
    
    P6 --> TC
    P7 --> TC
    
    P8 --> TP
    P9 --> TP

    style ADMIN fill:#ef4444,stroke:#dc2626,color:#fff
    style CONTADOR fill:#3b82f6,stroke:#2563eb,color:#fff
    style OPERADOR fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style SOCIO fill:#10b981,stroke:#059669,color:#fff
```

## 📈 Diagrama de Performance Comparison

```mermaid
graph LR
    subgraph Antes["❌ ANTES (Con Edge Functions)"]
        A1[Frontend] -->|1. signUp| A2[Supabase Auth]
        A2 -->|2. create user| A3[auth.users]
        A1 -->|3. POST| A4[Edge Function]
        A4 -->|4. RPC| A5[create_usuario]
        A5 -->|5. INSERT| A6[public.usuarios]
        
        A7[⏱️ 500-1500ms<br/>3 round-trips HTTP]
    end

    subgraph Ahora["✅ AHORA (Con Trigger)"]
        B1[Frontend] -->|1. signUp| B2[Supabase Auth]
        B2 -->|2. INSERT| B3[auth.users]
        B3 -->|3. TRIGGER| B4[handle_new_user]
        B4 -->|4. INSERT| B5[public.usuarios]
        
        B6[⚡ 150-400ms<br/>1 round-trip HTTP<br/>3x más rápido]
    end

    style A7 fill:#ef4444,stroke:#dc2626,color:#fff
    style B6 fill:#10b981,stroke:#059669,color:#fff
```

## 🎯 Diagrama de Casos de Uso

```mermaid
graph TD
    U[Usuario] --> UC1[Registrarse]
    U --> UC2[Iniciar sesión]
    U --> UC3[Ver mis cuotas]
    U --> UC4[Pagar cuota]
    U --> UC5[Ver mi perfil]
    
    A[Admin] --> UC6[Crear usuario]
    A --> UC7[Ver todos los usuarios]
    A --> UC8[Crear período]
    A --> UC9[Asignar cuota]
    A --> UC10[Ver reportes]
    
    C[Contador] --> UC11[Ver pagos]
    C --> UC12[Ver reportes]
    C --> UC13[Ver morosos]
    
    O[Operador] --> UC14[Gestionar cuotas]
    O --> UC15[Registrar pagos]
    O --> UC16[Ver usuarios]

    UC1 --> T[Trigger automático<br/>crea perfil]
    
    style UC1 fill:#10b981,stroke:#059669,color:#fff
    style T fill:#3b82f6,stroke:#2563eb,color:#fff
```

---

## 📝 Leyenda de Colores

- 🟢 **Verde** (#10b981): Trigger y operaciones exitosas
- 🔵 **Azul** (#3b82f6): Funciones y procesos internos
- 🟣 **Morado** (#8b5cf6): Base de datos y tablas
- 🟡 **Amarillo** (#f59e0b): Datos y entidades
- 🔴 **Rojo** (#ef4444): Errores y políticas de seguridad

---

## 💡 Uso de estos Diagramas

Estos diagramas podés:

1. **Incluirlos en documentación técnica**
2. **Presentarlos en reuniones de equipo**
3. **Usarlos para onboarding de nuevos devs**
4. **Referenciarlos durante troubleshooting**
5. **Exportarlos como imágenes** (Mermaid Live Editor)

Para renderizar estos diagramas:
- GitHub los muestra automáticamente en archivos .md
- VS Code: instalar extensión "Markdown Preview Mermaid Support"
- Online: https://mermaid.live/

---

¡Estos diagramas te ayudarán a visualizar y explicar el sistema completo! 🎨
