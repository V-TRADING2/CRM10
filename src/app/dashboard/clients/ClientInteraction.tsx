"use client"

import { useState } from "react"
import { addComment, changeStatus } from "./actions"
import { User, Phone, Mail, MessageSquare, Tag, Clock } from "lucide-react"

const ESTADOS = [
  "NUEVO",
  "INTERESADO",
  "BUSCANDO DINERO",
  "DEPOSITO",
  "SEGUIMIENTO",
  "POSITIVOS"
]

export default function ClientInteraction({ client }: { client: any }) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    if (newStatus === client.status) return
    setIsSubmitting(true)
    await changeStatus(client.id, client.status, newStatus)
    setIsSubmitting(false)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    setIsSubmitting(true)
    await addComment(client.id, comment)
    setComment("")
    setIsSubmitting(false)
  }

  // Helper para parsear la data extra
  let extraData = null
  try {
    extraData = client.extraData ? JSON.parse(client.extraData) : null
  } catch(e) {}

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {client.name ? client.name.charAt(0).toUpperCase() : <User size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">{client.name || 'Sin Nombre'}</h3>
              <p className="text-xs text-slate-500">ID: {client.id.slice(-5)}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <select 
              value={client.status} 
              onChange={handleStatusChange}
              disabled={isSubmitting}
              className="text-xs font-semibold rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-700 dark:text-slate-300 transition-all"
            >
              {ESTADOS.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-slate-400" />
            <span className="truncate">{client.phone || 'Sin Teléfono'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-slate-400" />
            <span className="truncate">{client.email || 'Sin Correo'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex-grow flex flex-col justify-end">
        {client.interactions.length > 0 && (
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className="text-xs font-medium text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1 transition-colors"
          >
            <Clock size={14} />
            {showHistory ? 'Ocultar Historial' : `Ver Historial (${client.interactions.length})`}
          </button>
        )}

        {showHistory && (
          <div className="mb-4 space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
            {client.interactions.map((int: any) => (
              <div key={int.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                <div className="flex justify-between items-center mb-1 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{int.user.name}</span>
                  <span>{new Date(int.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={`text-slate-600 dark:text-slate-400 ${int.type === 'STATUS_CHANGE' ? 'italic text-blue-600 dark:text-blue-400 font-medium' : ''}`}>
                  {int.notes}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddComment} className="mt-auto relative">
          <input 
            type="text" 
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Agregar un comentario..."
            disabled={isSubmitting}
            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
          <button 
            type="submit" 
            disabled={isSubmitting || !comment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50 p-1 rounded-md transition-colors"
          >
            <MessageSquare size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
