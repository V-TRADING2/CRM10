import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Upload, LayoutDashboard, LogOut, UserCheck, Eye } from "lucide-react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = session.user.role

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="w-full flex-none md:w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="flex h-20 items-center justify-center bg-blue-600 text-white font-black text-2xl tracking-widest shadow-md">
          CRM Hub
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="flex flex-col space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
              <LayoutDashboard size={20} />
              <span className="font-medium">Inicio</span>
            </Link>
            {role === 'ADMIN' && (
              <>
                <Link href="/dashboard/employees" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
                  <Users size={20} />
                  <span className="font-medium">Empleados</span>
                </Link>
                <Link href="/dashboard/upload" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
                  <Upload size={20} />
                  <span className="font-medium">Subir Excel</span>
                </Link>
                <Link href="/dashboard/assign" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
                  <UserCheck size={20} />
                  <span className="font-medium">Asignar Clientes</span>
                </Link>
                <Link href="/dashboard/tracking" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
                  <Eye size={20} />
                  <span className="font-medium">Seguimiento</span>
                </Link>
                <Link href="/dashboard/clients" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
                  <Users size={20} />
                  <span className="font-medium">Ver Todos</span>
                </Link>
              </>
            )}
            {role === 'EMPLOYEE' && (
              <Link href="/dashboard/clients" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-800 hover:text-white transition-all">
                <Users size={20} />
                <span className="font-medium">Mis Clientes</span>
              </Link>
            )}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">{role === 'ADMIN' ? 'Administrador' : 'Empleado'}</p>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-10">
        {children}
      </div>
    </div>
  )
}
