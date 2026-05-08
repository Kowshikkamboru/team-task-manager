'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import Badge from '@/components/Badge'
import { format } from 'date-fns'

type Project = {
  id: string; name: string; description: string | null; createdAt: string
  myRole: string; taskCount: number; memberCount: number; doneCount: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const r = await fetch('/api/projects')
    const d = await r.json()
    setProjects(d.projects || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setError(data.error); return }
    setShowCreate(false)
    setForm({ name: '', description: '' })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-600 font-medium">No projects yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first project to get started</p>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>Create Project</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const progress = p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0
            return (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group block">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                  <Badge value={p.myRole} />
                </div>
                {p.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <span>👥 {p.memberCount}</span>
                  <span>·</span>
                  <span>✓ {p.taskCount} tasks</span>
                  <span>·</span>
                  <span>{format(new Date(p.createdAt), 'MMM d')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-slate-400 mt-1">{progress}% complete</div>
              </Link>
            )
          })}
        </div>
      )}

      {showCreate && (
        <Modal title="Create Project" onClose={() => setShowCreate(false)}>
          {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="label">Project Name *</label>
              <input className="input" placeholder="e.g. Website Redesign"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none h-20" placeholder="What is this project about?"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
