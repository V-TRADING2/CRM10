"use client"

import { useState } from "react"
import ClientInteraction from "./ClientInteraction"
import { Search, Filter, X } from "lucide-react"

const ESTADOS = [
  "TODOS",
  "NUEVO",
  "INTERESADO",
  "BUSCANDO DINERO",
  "DEPOSITO",
  "SEGUIMIENTO",
  "POSITIVOS"
]

export default function ClientsList({ initialClients }: { initialClients: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("TODOS")

  const filteredClients = initialClients.filter(client => {
    // 1. Filtro de búsqueda
    const query = searchQuery.toLowerCase()
    let extraText = ""
    try {
      if (client.extraData) {
        const parsed = JSON.parse(client.extraData)
        extraText = Object.values(parsed).join(" ").toLowerCase()
      }
    } catch (e) {}

    const matchesSearch = (
      client.name?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.id?.toLowerCase().includes(query) ||
      extraText.includes(query)
    )

    // 2. Filtro de estado/tipificación
    const matchesStatus = selectedStatus === "TODOS" || client.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes por nombre, teléfono, email, extra..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all"
          >
            {ESTADOS.map(st => (
              <option key={st} value={st}>
                {st === "TODOS" ? "Todos los Estados" : st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados y lista */}
      <div className="flex justify-between items-center text-sm text-slate-500 px-1">
        <span>Mostrando {filteredClients.length} de {initialClients.length} cliente(s)</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No se encontraron clientes</h3>
            <p>Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        )}
        {filteredClients.map(client => (
          <ClientInteraction key={client.id} client={client} />
        ))}
      </div>
    </div>
  )
}
