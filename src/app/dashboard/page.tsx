import { auth } from "@/auth"
import { adminDb } from "@/lib/firebase-admin"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user
  let totalClients = 0
  let assignedClients = 0

  if (user.role === 'ADMIN') {
    const snap = await adminDb.collection("clients").count().get()
    totalClients = snap.data().count
  } else {
    const snap = await adminDb.collection("clients")
      .where("assignedToId", "==", user.id)
      .count()
      .get()
    assignedClients = snap.data().count
  }

  return (
    <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bienvenido, {user.name}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Aquí tienes un resumen de tu actividad en el CRM.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {user.role === 'ADMIN' ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">Total Clientes en Base</h2>
            <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{totalClients.toLocaleString()}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">Mis Clientes Asignados</h2>
            <p className="mt-3 text-4xl font-black text-blue-600 dark:text-blue-400">{assignedClients.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Acciones Rápidas</h3>
        {user.role === 'ADMIN' ? (
          <p className="text-slate-600 dark:text-slate-400">
            Usa el menú lateral para administrar cuentas de empleados, subir nuevas bases de datos desde Excel y distribuirlas entre tu equipo.
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">
            Dirígete a la sección "Mis Clientes" en el menú para comenzar a gestionar tus contactos, agregar comentarios o cambiar su tipificación.
          </p>
        )}
      </div>
    </main>
  )
}
