"use server"

import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function addComment(clientId: string, notes: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autenticado")

  await adminDb.collection("interactions").add({
    notes,
    type: "COMMENT",
    clientId,
    userId: session.user.id,
    userName: session.user.name || "Usuario",
    createdAt: new Date().toISOString(),
  })

  revalidatePath('/dashboard/clients')
}

export async function changeStatus(clientId: string, oldStatus: string, newStatus: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autenticado")

  await adminDb.collection("clients").doc(clientId).update({
    status: newStatus,
    updatedAt: new Date().toISOString(),
  })

  await adminDb.collection("interactions").add({
    notes: `Estado cambiado de "${oldStatus}" a "${newStatus}"`,
    type: "STATUS_CHANGE",
    clientId,
    userId: session.user.id,
    userName: session.user.name || "Usuario",
    createdAt: new Date().toISOString(),
  })

  revalidatePath('/dashboard/clients')
}
