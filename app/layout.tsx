import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskFlow – Team Task Manager',
  description: 'Manage projects, assign tasks, and track progress with your team.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
