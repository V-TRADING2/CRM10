import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AssignForm from "./AssignForm"

export default async function AssignPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const unassignedSnap = await adminDb.collection("clients")
    .where("assignedToId", "==", null)
    .count()
    .get()
  const unassignedCount = unassignedSnap.data().count

  const employeesSnap = await adminDb.collection("users")
    .where("role", "==", "EMPLOYEE")
    .get()

  const employees = await Promise.all(
    employeesSnap.docs.map(async doc => {
      const assignedSnap = await adminDb.collection("clients")
        .where("assignedToId", "==", doc.id)
        .count()
        .get()
      return {
        id: doc.id,
        name: doc.data().name,
        clientCount: assignedSnap.data().count,
      }
    })
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Asignación de Clientes</h2>
        <p className="text-slate-500">Reparte masivamente los clientes sin asignar entre tus empleados.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-2">Clientes Disponibles</h3>
          <p className="text-5xl font-black text-blue-600 dark:text-blue-400">{unassignedCount.toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-2">Esperando ser asignados</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Asignación Masiva</h3>
          {unassignedCount > 0 ? (
            <AssignForm employees={employees} maxClients={unassignedCount} />
          ) : (
            <div className="h-full flex items-center justify-center py-6">
              <p className="text-slate-500 font-medium">No hay clientes pendientes de asignar.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Carga de Trabajo Actual</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Empleado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Clientes Asignados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-500">No hay empleados registrados.</td>
              </tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{emp.name}</td>
                <td className="px-6 py-4 text-sm font-bold text-right text-slate-600 dark:text-slate-300">{emp.clientCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
