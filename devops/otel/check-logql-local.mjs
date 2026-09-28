import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const directory = dirname(fileURLToPath(import.meta.url))
const containerName = `capivara-loki-smoke-${process.pid}`

function docker(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('rtk', ['docker', ...args])
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', data => (stdout += data))
    child.stderr.on('data', data => (stderr += data))
    child.on('error', reject)
    child.on('close', code =>
      code === 0
        ? resolve(stdout.trim())
        : reject(new Error(`docker ${args[0]} failed: ${stderr.trim()}`))
    )
  })
}

try {
  await docker([
    'run',
    '-d',
    '--name',
    containerName,
    '-p',
    '127.0.0.1::3100',
    'grafana/loki:3.5.8'
  ])
  const address = await docker(['port', containerName, '3100/tcp'])
  const port = Number(address.match(/:(\d+)$/)?.[1])
  if (!port) throw new Error('Could not resolve Loki port')
  const baseUrl = `http://127.0.0.1:${port}`

  let ready = false
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/ready`)
      if (response.ok) {
        ready = true
        break
      }
    } catch {}
    await delay(250)
  }
  if (!ready) throw new Error('Loki did not become ready')

  const dashboard = JSON.parse(
    await readFile(join(directory, 'dashboards/api-logs.json'), 'utf8')
  )
  const now = Date.now() * 1e6
  for (const panel of dashboard.panels) {
    const url = new URL('/loki/api/v1/query_range', baseUrl)
    url.searchParams.set('query', panel.targets[0].expr)
    url.searchParams.set('start', String(now - 60e9))
    url.searchParams.set('end', String(now))
    url.searchParams.set('limit', '1')
    const response = await fetch(url)
    const result = await response.json()
    if (!response.ok || result.status !== 'success') {
      throw new Error(
        `LogQL panel ${panel.id}: ${result.error ?? response.status}`
      )
    }
  }
  console.log(`Validated ${dashboard.panels.length} LogQL expressions`)
} finally {
  await docker(['rm', '-f', containerName]).catch(() => {})
}
