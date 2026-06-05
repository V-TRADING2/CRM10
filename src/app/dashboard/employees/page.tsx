import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createEmployee, deleteEmployee } from "./actions"
import { Trash2 } from "lucide-react"

export default async function EmployeesPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const employeesSnap = await adminDb.collection("users")
    .where("role", "==", "EMPLOYEE")
    .get()

  const employees = employeesSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() as any }))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Empleados</h2>
        <p className="text-slate-500">Crea o elimina cuentas para tus empleados.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Agregar Nuevo Empleado</h3>
        <form action={createEmployee} className="grid gap-4 md:grid-cols-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
            <input name="name" type="text" required className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo</label>
            <input name="email" type="email" required className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
            <input name="password" type="password" required className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all shadow-md hover:shadow-lg h-[38px]">
            Crear Cuenta
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No hay empleados creados aún.</td>
              </tr>
            ) : employees.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{emp.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{emp.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={async () => {
                    "use server"
                    await deleteEmployee(emp.id)
                  }}>
                    <button type="submit" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all" title="Eliminar empleado">
                      <Trash2 size={18} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
