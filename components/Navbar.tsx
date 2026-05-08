'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navLink = (href: string, label: string) => (
    <Link href={href}
      className={`text-sm font-medium transition-colors ${pathname === href
        ? 'text-indigo-600'
        : 'text-slate-600 hover:text-slate-900'}`}>
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-slate-800">TaskFlow</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            {navLink('/dashboard', 'Dashboard')}
            {navLink('/projects', 'Projects')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                {user.name[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-600">{user.name}</span>
            </div>
          )}
          <button onClick={logout}
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
