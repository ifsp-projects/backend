import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const directory = join(dirname(fileURLToPath(import.meta.url)), 'dashboards')
const containerName = `capivara-prometheus-smoke-${process.pid}`

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
    '127.0.0.1::9090',
    'prom/prometheus:v3.8.1'
  ])
  const address = await docker(['port', containerName, '9090/tcp'])
  const port = Number(address.match(/:(\d+)$/)?.[1])
  if (!port) throw new Error('Could not resolve Prometheus port')
  const baseUrl = `http://127.0.0.1:${port}`

  let ready = false
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/-/ready`)
      if (response.ok) {
        ready = true
        break
      }
    } catch {}
    await delay(250)
  }
  if (!ready) throw new Error('Prometheus did not become ready')

  let checked = 0
  for (const file of (await readdir(directory)).filter(name =>
    name.endsWith('.json')
  )) {
    const dashboard = JSON.parse(await readFile(join(directory, file), 'utf8'))
    for (const panel of dashboard.panels) {
      if (panel.datasource.type !== 'prometheus') continue
      for (const target of panel.targets) {
        const expr = target.expr.replaceAll('$__rate_interval', '5m')
        const url = new URL('/api/v1/query', baseUrl)
        url.searchParams.set('query', expr)
        const response = await fetch(url)
        const result = await response.json()
        if (!response.ok || result.status !== 'success') {
          throw new Error(
            `${file} panel ${panel.id}: ${result.error ?? response.status}`
          )
        }
        checked++
      }
    }
  }
  console.log(`Validated ${checked} PromQL expressions`)
} finally {
  await docker(['rm', '-f', containerName]).catch(() => {})
}
