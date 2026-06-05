"use server"

import { adminDb } from "@/lib/firebase-admin"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createEmployee(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) throw new Error("Faltan campos")

  // Verificar que el email no exista ya
  const existing = await adminDb.collection("users")
    .where("email", "==", email)
    .limit(1)
    .get()

  if (!existing.empty) throw new Error("Ya existe un usuario con ese correo")

  const hashedPassword = await bcrypt.hash(password, 10)

  await adminDb.collection("users").add({
    name,
    email,
    password: hashedPassword,
    role: "EMPLOYEE",
    createdAt: new Date().toISOString(),
  })

  revalidatePath('/dashboard/employees')
}

export async function deleteEmployee(id: string) {
  // Primero desasignar todos sus clientes
  const clientsSnap = await adminDb.collection("clients")
    .where("assignedToId", "==", id)
    .get()

  const batch = adminDb.batch()
  clientsSnap.docs.forEach(doc => {
    batch.update(doc.ref, { assignedToId: null })
  })
  batch.delete(adminDb.collection("users").doc(id))
  await batch.commit()

  revalidatePath('/dashboard/employees')
}
