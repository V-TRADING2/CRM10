"use client"

import { useState } from "react"
import { assignClientsByCount } from "./actions"

export default function AssignForm({ employees, maxClients }: { employees: any[], maxClients: number }) {
  const [employeeId, setEmployeeId] = useState("")
  const [count, setCount] = useState<number | "">("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [message, setMessage] = useState("")

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || !count || count <= 0) return

    setIsAssigning(true)
    setMessage("")

    try {
      const res = await assignClientsByCount(employeeId, Number(count))
      setMessage(`¡Éxito! Se asignaron ${res.assignedCount} clientes.`)
      setCount("")
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <form onSubmit={handleAssign} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seleccionar Empleado</label>
        <select 
          required 
          value={employeeId} 
          onChange={e => setEmployeeId(e.target.value)}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Elige un empleado --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cantidad de Clientes</label>
        <input 
          type="number" 
          required 
          min="1" 
          max={maxClients}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          placeholder={`Máx: ${maxClients}`}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {message && <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500 font-medium'}`}>{message}</p>}

      <button 
        type="submit" 
        disabled={isAssigning}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-md transition-all shadow-md mt-2"
      >
        {isAssigning ? 'Asignando...' : 'Asignar Clientes'}
      </button>
    </form>
  )
}
