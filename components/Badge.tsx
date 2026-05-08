const config: Record<string, { label: string; classes: string }> = {
  TODO:        { label: 'To Do',       classes: 'bg-slate-100 text-slate-600' },
  IN_PROGRESS: { label: 'In Progress', classes: 'bg-blue-100 text-blue-700' },
  DONE:        { label: 'Done',        classes: 'bg-green-100 text-green-700' },
  OVERDUE:     { label: 'Overdue',     classes: 'bg-red-100 text-red-600' },
  LOW:         { label: 'Low',         classes: 'bg-slate-100 text-slate-500' },
  MEDIUM:      { label: 'Medium',      classes: 'bg-amber-100 text-amber-700' },
  HIGH:        { label: 'High',        classes: 'bg-red-100 text-red-600' },
  ADMIN:       { label: 'Admin',       classes: 'bg-indigo-100 text-indigo-700' },
  MEMBER:      { label: 'Member',      classes: 'bg-slate-100 text-slate-600' },
}

export default function Badge({ value }: { value: string }) {
  const { label, classes } = config[value] ?? { label: value, classes: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}
