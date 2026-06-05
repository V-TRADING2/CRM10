"use client"

import { useActionState } from "react"
import { authenticate } from "./actions"

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-600 p-4 md:h-36 shadow-lg">
          <div className="w-full text-white font-black text-3xl md:text-4xl tracking-tight">CRM Hub</div>
        </div>
        <form action={formAction} className="space-y-3">
          <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 px-6 pb-4 pt-8 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h1 className="mb-3 text-2xl font-bold dark:text-white">Inicia sesión</h1>
            <div className="w-full">
              <div>
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="email"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white py-[9px] px-3 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@crm.com"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    className="peer block w-full rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white py-[9px] px-3 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>
            <button
              className="mt-6 w-full bg-blue-600 text-white font-medium rounded-md p-2.5 hover:bg-blue-700 flex justify-center items-center transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
              aria-disabled={isPending}
              disabled={isPending}
            >
              {isPending ? 'Ingresando...' : 'Entrar al CRM'}
            </button>
            <div
              className="flex h-8 items-end space-x-1 mt-2"
              aria-live="polite"
              aria-atomic="true"
            >
              {errorMessage && (
                <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
