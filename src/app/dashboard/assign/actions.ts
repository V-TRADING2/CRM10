"use server"

import { adminDb } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

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
  return { success: true, assignedCount: unassignedSnap.docs.length }
}
