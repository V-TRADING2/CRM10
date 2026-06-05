/**
 * Script de Inicialización - Crea el usuario admin inicial en Firestore
 * Ejecutar: npx tsx --env-file=.env scripts/seed-firebase.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import bcrypt from "bcryptjs"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

async function seed() {
  console.log("🌱 Iniciando seed de Firestore...")

  const hashedPassword = await bcrypt.hash("admin123", 10)

  // Verificar si ya existe el admin
  const existing = await db.collection("users")
    .where("email", "==", "admin@crm.com")
    .limit(1)
    .get()

  if (!existing.empty) {
    console.log("✅ El usuario admin ya existe. No se creó uno nuevo.")
    return
  }

  await db.collection("users").add({
    name: "Administrador",
    email: "admin@crm.com",
    password: hashedPassword,
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  })

  console.log("✅ Usuario admin creado exitosamente!")
  console.log("   Email:     admin@crm.com")
  console.log("   Password:  admin123")
  console.log("   ⚠️  Cambia la contraseña después de iniciar sesión.")
}

seed().catch(console.error)
