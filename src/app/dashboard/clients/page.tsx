import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClientInteraction from "./ClientInteraction"

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  let clientsSnap
  if (session.user.role === 'ADMIN') {
    clientsSnap = await adminDb.collection("clients")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get()
  } else {
    clientsSnap = await adminDb.collection("clients")
      .where("assignedToId", "==", session.user.id)
      .orderBy("createdAt", "desc")
      .get()
  }

  // Para cada cliente obtenemos sus interacciones
  const clients = await Promise.all(
    clientsSnap.docs.map(async doc => {
      const client = { id: doc.id, ...doc.data() as any }
      const interactionsSnap = await adminDb.collection("interactions")
        .where("clientId", "==", doc.id)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get()
      client.interactions = interactionsSnap.docs.map(i => ({ id: i.id, ...i.data() }))
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
          {session.user.role === 'ADMIN' && <span className="ml-1 text-xs text-amber-600">(Vista de administrador – mostrando los últimos 200)</span>}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {clients.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tienes clientes</h3>
            <p>Aún no se te han asignado clientes para gestionar.</p>
          </div>
        )}
        {clients.map(client => (
          <ClientInteraction key={client.id} client={client} />
        ))}
      </div>
    </div>
  )
}
