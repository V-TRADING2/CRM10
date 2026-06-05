import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClientsList from "./ClientsList"

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  let clientsSnap
  if (session.user.role === 'ADMIN') {
    // Para administradores, traemos todos los clientes sin límites restrictivos o limitados a 1000
    clientsSnap = await adminDb.collection("clients")
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get()
  } else {
    // Para empleados, traemos todos sus clientes asignados
    clientsSnap = await adminDb.collection("clients")
      .where("assignedToId", "==", session.user.id)
      .get()
  }

  let docs = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
  if (session.user.role !== 'ADMIN') {
    docs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }

  // Para cada cliente obtenemos sus interacciones
  const clients = await Promise.all(
    docs.map(async client => {
      const interactionsSnap = await adminDb.collection("interactions")
        .where("clientId", "==", client.id)
        .get()

      client.interactions = interactionsSnap.docs
        .map(i => ({ id: i.id, ...i.data() as any }))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10)

      return client
    })
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {session.user.role === 'ADMIN' ? 'Todos los Clientes' : 'Mis Clientes'}
        </h2>
        <p className="text-slate-500">
          Visualiza los detalles, agrega comentarios al historial y cambia la tipificación.
          {session.user.role === 'ADMIN' && <span className="ml-1 text-xs text-amber-600">(Vista de administrador – mostrando los últimos 1,000)</span>}
        </p>
      </div>

      <ClientsList initialClients={clients} />
    </div>
  )
}
