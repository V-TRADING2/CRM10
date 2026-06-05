"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function assignClientsByCount(employeeId: string, count: number) {
  if (count <= 0) throw new Error("La cantidad debe ser mayor a 0")

  // Obtener clientes sin asignar
  const unassignedSnap = await adminDb.collection("clients")
    .where("assignedToId", "==", null)
    .limit(count)
    .get()

  if (unassignedSnap.empty) throw new Error("No hay clientes sin asignar")

  const batch = adminDb.batch()
  unassignedSnap.docs.forEach(doc => {
    batch.update(doc.ref, { assignedToId: employeeId })
  })
  await batch.commit()

  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/clients')
  return { success: true, assignedCount: unassignedSnap.docs.length }
}

export async function assignIndividualClients(employeeId: string, clientIds: string[]) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error("No autorizado")

  if (!employeeId || clientIds.length === 0) throw new Error("Selecciona un empleado y al menos un cliente")

  // Firestore batch tiene límite de 500
  const CHUNK_SIZE = 500
  let totalAssigned = 0

  for (let i = 0; i < clientIds.length; i += CHUNK_SIZE) {
    const chunk = clientIds.slice(i, i + CHUNK_SIZE)
    const batch = adminDb.batch()
    chunk.forEach(clientId => {
      const ref = adminDb.collection("clients").doc(clientId)
      batch.update(ref, { assignedToId: employeeId })
    })
    await batch.commit()
    totalAssigned += chunk.length
  }

  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/clients')
  return { success: true, assignedCount: totalAssigned }
}

export async function unassignClient(clientId: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error("No autorizado")

  await adminDb.collection("clients").doc(clientId).update({
    assignedToId: null
  })

  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/tracking')
  return { success: true }
}
