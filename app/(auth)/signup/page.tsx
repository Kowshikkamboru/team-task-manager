'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
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
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Create an account</h2>
      <p className="text-slate-500 text-sm mb-6">Start managing your team's tasks</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" type="text" placeholder="Alex Johnson"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input className="input" type="password" placeholder="••••••••"
            value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
        </div>
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
      </p>
    </>
  )
}
