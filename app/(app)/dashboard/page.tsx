'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/Badge'
import { format } from 'date-fns'

type DashboardData = {
  stats: { total: number; todo: number; inProgress: number; done: number; overdue: number }
  myTasks: Array<{
    id: string; title: string; status: string; priority: string; dueDate: string | null
    project: { id: string; name: string }
  }>
  projects: Array<{ id: string; name: string; taskCount: number; memberCount: number; myRole: string }>
}

const statCards = [
  { key: 'total',      label: 'Total Tasks',   color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { key: 'inProgress', label: 'In Progress',   color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'done',       label: 'Completed',     color: 'bg-green-50 text-green-700 border-green-100' },
  { key: 'overdue',    label: 'Overdue',       color: 'bg-red-50 text-red-700 border-red-100' },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your task overview at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, color }) => (
          <div key={key} className={`card p-5 border ${color}`}>
            <div className="text-3xl font-bold">{data.stats[key as keyof typeof data.stats]}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Tasks */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">My Tasks</h2>
          {data.myTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No tasks assigned to you yet</div>
          ) : (
            <div className="space-y-3">
              {data.myTasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                return (
                  <div key={task.id} className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <Link href={`/projects/${task.project.id}`}
                        className="text-sm font-medium text-slate-800 hover:text-indigo-600 truncate block">
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{task.project.name}</span>
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                            · {isOverdue ? '⚠ ' : ''}{format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge value={task.priority} />
                      <Badge value={isOverdue ? 'OVERDUE' : task.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">My Projects</h2>
            <Link href="/projects" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          {data.projects.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No projects yet.{' '}
              <Link href="/projects" className="text-indigo-600 hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.projects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div>
                    <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {p.memberCount} member{p.memberCount !== 1 ? 's' : ''} · {p.taskCount} task{p.taskCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Badge value={p.myRole} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
