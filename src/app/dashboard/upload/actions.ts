"use server"

import { adminDb } from "@/lib/firebase-admin"
import * as xlsx from "xlsx"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function uploadExcel(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) throw new Error("No se subió archivo")

  const buffer = await file.arrayBuffer()
  const workbook = xlsx.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(worksheet)

  if (!data || data.length === 0) throw new Error("El Excel está vacío")

  const clientsToInsert = data.map((row: any) => {
    const getField = (keys: string[]) => {
      for (const k of Object.keys(row)) {
        if (keys.includes(k.toLowerCase().trim())) return String(row[k])
      }
      return null
    }

    const name = getField(['nombre', 'name', 'cliente', 'contacto']) || ''
    const phone = getField(['telefono', 'teléfono', 'tel', 'phone', 'celular', 'número', 'numero']) || ''
    const email = getField(['correo', 'email', 'e-mail', 'mail']) || ''

    // Guardar todas las columnas del Excel como datos extra
    const extraData: Record<string, any> = {}
    Object.keys(row).forEach(k => { extraData[k] = row[k] })

    return {
      name,
      phone,
      email,
      status: "NUEVO",
      extraData: JSON.stringify(extraData),
      assignedToId: null,
      createdAt: new Date().toISOString()
    }
  })

  // Insertar en Firestore en lotes de 500 (límite de Firestore)
  const CHUNK_SIZE = 500
  let insertedCount = 0

  for (let i = 0; i < clientsToInsert.length; i += CHUNK_SIZE) {
    const chunk = clientsToInsert.slice(i, i + CHUNK_SIZE)
    const batch = adminDb.batch()
    chunk.forEach(client => {
      const ref = adminDb.collection("clients").doc()
      batch.set(ref, client)
    })
    await batch.commit()
    insertedCount += chunk.length
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/upload')
  return { success: true, count: insertedCount }
}

export async function deleteAllClients() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error("No autorizado")

  // Eliminar todos los clientes en lotes
  let totalDeleted = 0
  let hasMore = true

  while (hasMore) {
    const snapshot = await adminDb.collection("clients").limit(500).get()

    if (snapshot.empty) {
      hasMore = false
      break
    }

    const batch = adminDb.batch()
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    await batch.commit()
    totalDeleted += snapshot.docs.length
  }

  // Eliminar todas las interacciones también
  hasMore = true
  while (hasMore) {
    const snapshot = await adminDb.collection("interactions").limit(500).get()
    if (snapshot.empty) {
      hasMore = false
      break
    }
    const batch = adminDb.batch()
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    await batch.commit()
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/upload')
  revalidatePath('/dashboard/clients')
  return { success: true, deleted: totalDeleted }
}
