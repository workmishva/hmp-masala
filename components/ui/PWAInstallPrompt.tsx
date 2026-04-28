'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = sessionStorage.getItem('pwa-dismissed')
    if (stored) { setDismissed(true); return }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1')
    setShow(false)
    setDismissed(true)
  }

  if (!show || dismissed || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white dark:bg-masala-900 border border-masala-200 dark:border-masala-700 rounded-2xl shadow-card-hover p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center shrink-0">
        <Download className="w-5 h-5 text-saffron-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-masala-900 dark:text-masala-100">Install HMP Masala</p>
        <p className="text-xs text-masala-500 dark:text-masala-400 mt-0.5">Add to your home screen for quick access</p>
        <button
          onClick={handleInstall}
          className="mt-2 text-xs font-semibold text-saffron-600 hover:text-saffron-700 transition-colors"
        >
          Install App
        </button>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="p-1 rounded-lg text-masala-400 hover:text-masala-700 dark:hover:text-masala-200 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
