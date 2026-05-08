'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Welcome back</h2>
      <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-500">
        <p className="font-medium mb-1">Demo credentials:</p>
        <p>Admin: admin@demo.com / password123</p>
        <p>Member: member@demo.com / password123</p>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        No account?{' '}
        <Link href="/signup" className="text-indigo-600 font-medium hover:underline">Sign up</Link>
      </p>
    </>
  )
}
