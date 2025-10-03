'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const Ctx = createContext(null)
const KEY = 'tr:cart'

export function CartProvider({ children }){
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(KEY)
      setItems(raw? JSON.parse(raw) : [])
    } catch {}
  }, [])
  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const add = (item, qty=1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.slug === item.slug)
      if (i >= 0) {
        const next = [...prev]; next[i] = { ...next[i], qty: next[i].qty + qty }
        return next
      }
      return [...prev, { ...item, qty }]
    })
    setOpen(true)
  }
  const setQty = (slug, qty) => setItems(prev => prev.map(x => x.slug===slug? { ...x, qty } : x).filter(x=>x.qty>0))
  const remove = (slug) => setItems(prev => prev.filter(x => x.slug !== slug))
  const clear = () => setItems([])

  const count = items.reduce((s,i)=>s+i.qty,0)
  const total = items.reduce((s,i)=>s+i.price*i.qty,0)

  const value = useMemo(()=>({ items, open, setOpen, add, remove, setQty, clear, count, total }), [items, open, count, total])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCart = () => useContext(Ctx)
