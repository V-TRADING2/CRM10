"use client"

import { useState } from "react"
import { unassignClientFromEmployee, reassignClient } from "./actions"
import { User, Phone, Mail, UserMinus, RefreshCw, ChevronDown, ChevronUp, Search, Calendar, MessageSquare } from "lucide-react"

interface Client {
  id: string
  name: string
  phone: string
  email: string
  status: string
  assignedToId: string
  createdAt: string
  updatedAt?: string
  interactions?: any[]
}

interface Employee {
  id: string
  name: string
  email: string
  clients: Client[]
}

export default function TrackingView({ initialEmployees, allEmployeesList }: { initialEmployees: Employee[], allEmployeesList: { id: string; name: string }[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set(initialEmployees.map(e => e.id)))
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  const toggleEmployeeExpand = (empId: string) => {
    const newSet = new Set(expandedEmployees)
    if (newSet.has(empId)) {
      newSet.delete(empId)
    } else {
      newSet.add(empId)
    }
    setExpandedEmployees(newSet)
  }

  const handleUnassign = async (clientId: string, employeeId: string) => {
    setLoadingMap(prev => ({ ...prev, [clientId]: true }))
    try {
      await unassignClientFromEmployee(clientId)
      // Update local state
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            clients: emp.clients.filter(c => c.id !== clientId)
          }
        }
        return emp
      }))
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    } finally {
      setLoadingMap(prev => ({ ...prev, [clientId]: false }))
    }
  }

  const handleReassign = async (clientId: string, currentEmployeeId: string, targetEmployeeId: string) => {
    if (!targetEmployeeId) return
    setLoadingMap(prev => ({ ...prev, [clientId]: true }))
    try {
      await reassignClient(clientId, targetEmployeeId)
      // Update local state by moving client
      let clientToMove: Client | null = null
      
      const updatedEmployees = employees.map(emp => {
        if (emp.id === currentEmployeeId) {
          clientToMove = emp.clients.find(c => c.id === clientId) || null
          return {
            ...emp,
            clients: emp.clients.filter(c => c.id !== clientId)
          }
        }
        return emp
      })

      if (clientToMove) {
        const targetName = allEmployeesList.find(e => e.id === targetEmployeeId)?.name || "Empleado"
        // Update client info
        const updatedClient = { ...(clientToMove as any), assignedToId: targetEmployeeId }
        setEmployees(updatedEmployees.map(emp => {
          if (emp.id === targetEmployeeId) {
            return {
              ...emp,
              clients: [updatedClient, ...emp.clients]
            }
          }
          return emp
        }))
      } else {
        setEmployees(updatedEmployees)
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    } finally {
      setLoadingMap(prev => ({ ...prev, [clientId]: false }))
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NUEVO": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "INTERESADO": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "BUSCANDO DINERO": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "DEPOSITO": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "SEGUIMIENTO": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "POSITIVOS": return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
    }
  }

  const filteredEmployees = employees.map(emp => {
    const matchedClients = emp.clients.filter(c => {
      const query = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query)
      )
    })
    return { ...emp, clients: matchedClients }
  }).filter(emp => emp.clients.length > 0 || searchQuery === "")

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por cliente, teléfono, correo o estado..."
          className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Grid de empleados y sus clientes */}
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No se encontraron empleados o clientes con la búsqueda actual.
          </div>
        ) : filteredEmployees.map(emp => (
          <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header de Empleado */}
            <button
              onClick={() => toggleEmployeeExpand(emp.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{emp.name}</h3>
                  <p className="text-xs text-slate-500">{emp.email} • {emp.clients.length} cliente(s) asignado(s)</p>
                </div>
              </div>
              <div className="text-slate-400">
                {expandedEmployees.has(emp.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Listado de Clientes del Empleado */}
            {expandedEmployees.has(emp.id) && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {emp.clients.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400 italic">
                    Este empleado no tiene clientes asignados en este momento.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {emp.clients.map(client => (
                      <div key={client.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        {/* Info del Cliente */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">{client.name || 'Sin Nombre'}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(client.status)}`}>
                              {client.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} className="text-slate-400" />
                                {client.phone}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={12} className="text-slate-400" />
                                {client.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400" />
                              Asignado: {new Date(client.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Último comentario si existe */}
                          {client.interactions && client.interactions.length > 0 && (
                            <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                              <MessageSquare size={12} className="mt-0.5 text-blue-500 flex-shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold">{client.interactions[0].userName}: </span>
                                <span>{client.interactions[0].notes}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Acciones de Reasignación / Unassign */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Reasignar a otro empleado */}
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <RefreshCw size={13} className="text-slate-400" />
                            <select
                              disabled={loadingMap[client.id]}
                              onChange={(e) => handleReassign(client.id, emp.id, e.target.value)}
                              defaultValue=""
                              className="text-xs bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            >
                              <option value="" disabled>Reasignar a...</option>
                              {allEmployeesList.filter(e => e.id !== emp.id).map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Quitar asignación */}
                          <button
                            disabled={loadingMap[client.id]}
                            onClick={() => handleUnassign(client.id, emp.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 transition-colors"
                            title="Quitar asignación y devolver a la bolsa de clientes"
                          >
                            <UserMinus size={14} />
                            Desasignar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
