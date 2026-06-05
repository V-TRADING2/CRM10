"use client"

import { useState } from "react"
import { assignIndividualClients } from "./actions"
import { Search, User, Phone, CheckSquare, Square } from "lucide-react"

interface Client {
  id: string
  name: string
  phone: string
  email: string
}

interface Employee {
  id: string
  name: string
  clientCount: number
}

export default function IndividualAssignForm({ clients, employees }: { clients: Client[], employees: Employee[] }) {
  const [employeeId, setEmployeeId] = useState("")
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [message, setMessage] = useState("")

  const filteredClients = clients.filter(c => {
    const query = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    )
  })

  const toggleClient = (clientId: string) => {
    const newSet = new Set(selectedClients)
    if (newSet.has(clientId)) {
      newSet.delete(clientId)
    } else {
      newSet.add(clientId)
    }
    setSelectedClients(newSet)
  }

  const selectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set())
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)))
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || selectedClients.size === 0) return

    setIsAssigning(true)
    setMessage("")

    try {
      const res = await assignIndividualClients(employeeId, Array.from(selectedClients))
      setMessage(`¡Éxito! Se asignaron ${res.assignedCount} clientes.`)
      setSelectedClients(new Set())
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Selección de empleado */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asignar a Empleado</label>
        <select
          required
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Elige un empleado --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name} ({emp.clientCount} clientes)</option>
          ))}
        </select>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, teléfono o correo..."
          className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Selección masiva y contador */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={selectAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {selectedClients.size === filteredClients.length && filteredClients.length > 0
            ? 'Deseleccionar todos'
            : `Seleccionar todos (${filteredClients.length})`}
        </button>
        <span className="text-sm text-slate-500 font-medium">
          {selectedClients.size} seleccionado{selectedClients.size !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de clientes con checkbox */}
      <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {searchQuery ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes sin asignar.'}
          </div>
        ) : filteredClients.map(client => (
          <button
            key={client.id}
            type="button"
            onClick={() => toggleClient(client.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
              selectedClients.has(client.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex-shrink-0 text-blue-500">
              {selectedClients.has(client.id) ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-400" />}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
              {client.name ? client.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {client.name || 'Sin Nombre'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={10} />
                    {client.phone}
                  </span>
                )}
                {client.email && <span className="truncate">{client.email}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {message && <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500 font-medium'}`}>{message}</p>}

      {/* Botón de asignación */}
      <button
        onClick={handleAssign}
        disabled={isAssigning || !employeeId || selectedClients.size === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-md transition-all shadow-md"
      >
        {isAssigning
          ? 'Asignando...'
          : `Asignar ${selectedClients.size} cliente${selectedClients.size !== 1 ? 's' : ''} al empleado`}
      </button>
    </div>
  )
}
