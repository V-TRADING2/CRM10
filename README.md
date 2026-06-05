# CRM Hub

Sistema CRM construido con **Next.js**, **Firebase Firestore** y **Auth.js** para la gestión de clientes.

## Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd crm-app
npm install
```

### 2. Configurar variables de entorno
Copia el archivo de ejemplo y llena los valores:
```bash
cp .env.example .env
```

Necesitas los siguientes valores:
- `AUTH_SECRET`: Cualquier cadena larga y aleatoria (mínimo 32 caracteres)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Obtenlos en Firebase Console → Project Settings → Service Accounts → **Generate new private key**

### 3. Crear el usuario Administrador inicial
```bash
npx tsx scripts/seed-firebase.ts
```
Esto crea el usuario `admin@crm.com` con contraseña `admin123`.

### 4. Configurar reglas de Firestore
En Firebase Console → Firestore → Reglas, coloca:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Solo acceso desde el servidor
    }
  }
}
```

### 5. Iniciar el servidor
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

## Despliegue en Vercel
1. Sube el código a GitHub
2. Conecta el repositorio en [vercel.com](https://vercel.com)
3. Agrega las variables de entorno en Vercel → Settings → Environment Variables
4. ¡Listo!
