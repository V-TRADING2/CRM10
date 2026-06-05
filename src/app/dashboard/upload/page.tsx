"use client"

import { useState } from "react"
import { uploadExcel } from "./actions"
import { Upload as UploadIcon, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadExcel(formData)
      setResult(res)
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subir Base de Datos</h2>
        <p className="text-slate-500">Sube tu archivo Excel (.xlsx o .csv) con los contactos. El sistema buscará columnas llamadas Nombre, Teléfono y Correo. El resto de datos se guardarán como información extra.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        {!result?.success ? (
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800 hover:bg-slate-100 transition-all dark:border-slate-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Haz clic para seleccionar</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">XLSX, CSV</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={e => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            
            {file && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800">
                <span className="font-medium truncate">{file.name}</span>
                <span className="text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}

            {result?.error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <AlertCircle size={20} />
                <span>{result.error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!file || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isUploading ? 'Procesando archivo, por favor espera...' : 'Subir y Procesar Clientes'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">¡Subida Exitosa!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Se han importado <strong className="text-slate-900 dark:text-white">{result.count}</strong> clientes a la base de datos.
            </p>
            <div className="pt-6 flex justify-center gap-4">
              <button onClick={() => { setFile(null); setResult(null); }} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Subir otro
              </button>
              <Link href="/dashboard/assign" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                Ir a Asignar Clientes
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
