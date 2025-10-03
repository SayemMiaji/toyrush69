'use client'
import { useToast } from './ToastContext'

export default function ToastViewport(){
  const { toasts } = useToast()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 mx-auto flex w-full max-w-md flex-col items-center gap-2 px-4" style={{ zIndex: 100 }}>
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm shadow-lg dark:border-white/10 dark:bg-neutral-900">
          {t.message}
        </div>
      ))}
    </div>
  )
}
