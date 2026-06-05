"use server"

import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function unassignClientFromEmployee(clientId: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error("No autorizado")

  await adminDb.collection("clients").doc(clientId).update({
    assignedToId: null
  })

  revalidatePath('/dashboard/tracking')
  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/clients')
  return { success: true }
}

export async function reassignClient(clientId: string, newEmployeeId: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error("No autorizado")

  await adminDb.collection("clients").doc(clientId).update({
    assignedToId: newEmployeeId,
    updatedAt: new Date().toISOString()
  })

  revalidatePath('/dashboard/tracking')
  revalidatePath('/dashboard/assign')
  revalidatePath('/dashboard/clients')
  return { success: true }
}
