'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])
  const show = useCallback((message, opts={}) => {
    const id = Math.random().toString(36).slice(2)
    const t = { id, message, duration: opts.duration ?? 1800 }
    setToasts(prev => [...prev, t])
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id))
    }, t.duration)
  }, [])
  return (
    <ToastCtx.Provider value={{ show, toasts, setToasts }}>
      {children}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
