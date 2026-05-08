'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import Badge from '@/components/Badge'
import { format } from 'date-fns'

type Member = { id: string; name: string; email: string; role: string }
type Task = {
  id: string; title: string; description: string | null; status: string
  priority: string; dueDate: string | null; createdAt: string
  assignee: { id: string; name: string } | null
  creator: { id: string; name: string }
}
type Project = {
  id: string; name: string; description: string | null; ownerId: string
  myRole: string; members: Member[]; tasks: Task[]
}

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const
const STATUS_LABELS: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [me, setMe] = useState<{ id: string; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'tasks' | 'members'>('tasks')

  // Task modal state
  const [showTask, setShowTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' })
  const [taskSaving, setTaskSaving] = useState(false)
  const [taskError, setTaskError] = useState('')

  // Member modal state
  const [showMember, setShowMember] = useState(false)
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' })
  const [memberSaving, setMemberSaving] = useState(false)
  const [memberError, setMemberError] = useState('')

  async function load() {
    const [projRes, meRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch('/api/auth/me'),
    ])
    if (!projRes.ok) { router.push('/projects'); return }
    const [projData, meData] = await Promise.all([projRes.json(), meRes.json()])
    setProject(projData.project)
    setMe(meData.user)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const isAdmin = project?.myRole === 'ADMIN'

  async function updateTaskStatus(taskId: string, status: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    load()
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    setTaskError('')
    setTaskSaving(true)
    const body = { ...taskForm, dueDate: taskForm.dueDate || undefined, assigneeId: taskForm.assigneeId || undefined }
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setTaskSaving(false)
    if (!res.ok) { setTaskError(data.error); return }
    setShowTask(false)
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' })
    load()
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    setMemberError('')
    setMemberSaving(true)
    const res = await fetch(`/api/projects/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberForm),
    })
    const data = await res.json()
    setMemberSaving(false)
    if (!res.ok) { setMemberError(data.error); return }
    setShowMember(false)
    setMemberForm({ email: '', role: 'MEMBER' })
    load()
  }

  async function removeMember(userId: string) {
    if (!confirm('Remove this member from the project?')) return
    await fetch(`/api/projects/${id}/members/${userId}`, { method: 'DELETE' })
    load()
  }

  async function deleteProject() {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/projects')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!project) return null

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = project.tasks.filter(t => t.status === s)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
            <Badge value={project.myRole} />
          </div>
          {project.description && <p className="text-slate-500 text-sm">{project.description}</p>}
          <p className="text-slate-400 text-xs mt-1">{project.members.length} members · {project.tasks.length} tasks</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button className="btn-danger text-sm" onClick={deleteProject}>Delete Project</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['tasks', 'members'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t} {t === 'tasks' ? `(${project.tasks.length})` : `(${project.members.length})`}
          </button>
        ))}
      </div>

      {/* Tasks Kanban */}
      {tab === 'tasks' && (
        <div>
          {isAdmin && (
            <div className="flex justify-end mb-4">
              <button className="btn-primary" onClick={() => setShowTask(true)}>+ Add Task</button>
            </div>
          )}
          <div className="grid lg:grid-cols-3 gap-4">
            {STATUSES.map(status => (
              <div key={status} className="bg-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</span>
                  <span className="text-xs bg-white text-slate-500 rounded-full px-2 py-0.5 font-medium">
                    {tasksByStatus[status].length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasksByStatus[status].map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                    return (
                      <div key={task.id} className="card p-3 group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800 flex-1">{task.title}</p>
                          {isAdmin && (
                            <button onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-xs shrink-0">✕</button>
                          )}
                        </div>
                        {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge value={task.priority} />
                          {isOverdue && <Badge value="OVERDUE" />}
                        </div>
                        {task.dueDate && (
                          <p className={`text-xs mt-1.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                            Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </p>
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                              {task.assignee.name[0]}
                            </div>
                            <span className="text-xs text-slate-500">{task.assignee.name}</span>
                          </div>
                        )}
                        {/* Status changer */}
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <select
                            className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={task.status}
                            onChange={e => updateTaskStatus(task.id, e.target.value)}>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                      </div>
                    )
                  })}
                  {tasksByStatus[status].length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Team Members</h2>
            {isAdmin && (
              <button className="btn-primary text-sm" onClick={() => setShowMember(true)}>+ Add Member</button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {project.members.map(m => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.name}
                      {m.id === project.ownerId && <span className="ml-2 text-xs text-slate-400">(owner)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={m.role} />
                  {isAdmin && m.id !== project.ownerId && m.id !== me?.id && (
                    <button className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      onClick={() => removeMember(m.id)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTask && (
        <Modal title="Add New Task" onClose={() => setShowTask(false)}>
          {taskError && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{taskError}</div>}
          <form onSubmit={createTask} className="space-y-3">
            <div>
              <label className="label">Title *</label>
              <input className="input" placeholder="Task title"
                value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none h-16" placeholder="Optional description"
                value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Priority</label>
                <select className="input" value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input className="input" type="date"
                  value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Assign To</label>
              <select className="input" value={taskForm.assigneeId}
                onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowTask(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={taskSaving}>
                {taskSaving ? 'Adding…' : 'Add Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {showMember && (
        <Modal title="Add Team Member" onClose={() => setShowMember(false)}>
          {memberError && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{memberError}</div>}
          <form onSubmit={addMember} className="space-y-3">
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="colleague@example.com"
                value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} required />
              <p className="text-xs text-slate-400 mt-1">User must already have an account</p>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={memberForm.role}
                onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                <option value="MEMBER">Member – can update task status</option>
                <option value="ADMIN">Admin – full project access</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowMember(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={memberSaving}>
                {memberSaving ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
