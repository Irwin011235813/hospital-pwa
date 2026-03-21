# Hospital Municipal — PWA

Sistema de turnos digitales para hospital municipal.  
Stack: React 18 + TypeScript + Tailwind CSS + Firebase + Vite + PWA.

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# → Completá con los valores de tu proyecto Firebase

# 3. Aplicar reglas de Firestore
# En Firebase Console → Firestore → Reglas → pegá el contenido de firestore.rules

# 4. Crear el primer usuario admin
# Logueate con Google, luego desde Firebase Console
# editá el documento users/{tu-uid} y cambiá role a "admin"

# 5. Desarrollo
npm run dev

# 6. Build para producción
npm run build
```

## Deploy en Vercel

```bash
vercel --prod
# Agregá las VITE_FIREBASE_* como Environment Variables en el panel de Vercel
```

## Estructura del proyecto

```
src/
├── App.tsx                    # Rutas y guards de autenticación
├── main.tsx
├── index.css
├── context/
│   └── AuthContext.tsx        # Estado global de autenticación
├── hooks/
│   ├── useAppointments.ts     # Lógica de turnos (paciente y admin)
│   ├── useMedicalRecords.ts   # Lógica de historial médico
│   └── useBooking.ts          # Máquina de estados del flujo de reserva
├── services/
│   ├── userService.ts         # CRUD de usuarios en Firestore
│   ├── appointmentService.ts  # CRUD de turnos en Firestore
│   └── medicalRecordService.ts# CRUD de historial en Firestore
├── lib/
│   ├── firebase.ts            # Inicialización de Firebase
│   └── constants.ts           # Especialidades y médicos de referencia
├── types/
│   └── index.ts               # Tipos TypeScript del dominio
├── components/
│   ├── ui/                    # Badge, Spinner, EmptyState, Alert
│   ├── layout/                # PageHeader, BottomNav, LoadingScreen
│   └── patient/               # AppointmentCard
└── pages/
    ├── LoginPage.tsx
    ├── SetupDniPage.tsx
    ├── patient/               # Dashboard, BookAppointment, MedicalRecords
    └── admin/                 # AdminDashboard, AttendPatient, SearchPatient
```

## Roles

| Rol     | Acceso                                              |
|---------|-----------------------------------------------------|
| patient | Dashboard, solicitar turno, ver historial propio    |
| admin   | Agenda diaria, atender pacientes, buscar por DNI   |

## PWA — Instalación por QR

1. Hacé build y deploy en Vercel
2. Generá un QR con la URL de producción (ej: qr-code-generator.com)
3. El usuario escanea el QR → el navegador ofrece "Añadir a pantalla de inicio"
4. La app se instala sin Play Store en modo `standalone`

## Iconos PWA

Generá los iconos con [RealFaviconGenerator](https://realfavicongenerator.net)  
o [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)  
y colocá los archivos en `/public/icons/`.
