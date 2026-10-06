import { createContext, useContext } from 'react'

export type Toast = { id: number; text: string; kind: 'ok' | 'error' }
export type ToastContextValue = { toast: (text: string, kind?: Toast['kind']) => void }

export const ToastCtx = createContext<ToastContextValue>({ toast: () => {} })
export const useToast = () => useContext(ToastCtx)
