import { adminDb } from "@/lib/firebase-admin"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TrackingView from "./TrackingView"

export default async function TrackingPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  // Obtener todos los empleados
  const employeesSnap = await adminDb.collection("users")
    .where("role", "==", "EMPLOYEE")
    .get()

  const employeesList = employeesSnap.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name || "Empleado",
    email: doc.data().email || "",
    clients: [] as any[]
  }))

  const allEmployeesList = employeesList.map(e => ({ id: e.id, name: e.name }))

  // Obtener todos los clientes que están asignados a algún empleado
  const clientsSnap = await adminDb.collection("clients")
    .where("assignedToId", "!=", null)
    .get()

  const clientsList = clientsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as any
  }))

  // Para cada cliente, obtener su última interacción/comentario
  const clientsWithInteractions = await Promise.all(
    clientsList.map(async client => {
      const interactionsSnap = await adminDb.collection("interactions")
        .where("clientId", "==", client.id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get()

      const interactions = interactionsSnap.docs.map(i => ({ id: i.id, ...i.data() as any }))
      return {
        ...client,
        interactions
      }
    })
  )

  // Agrupar los clientes por empleado
  employeesList.forEach(emp => {
    emp.clients = clientsWithInteractions.filter(c => c.assignedToId === emp.id)
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Seguimiento de Asignaciones</h2>
        <p className="text-slate-500">
          Supervisa el progreso de tus empleados, visualiza sus clientes asignados y reasigna o desasigna contactos según sea necesario.
        </p>
      </div>

      <TrackingView initialEmployees={employeesList} allEmployeesList={allEmployeesList} />
    </div>
  )
}
