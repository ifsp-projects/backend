import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const directory = dirname(fileURLToPath(import.meta.url))
const containerName = `capivara-grafana-smoke-${process.pid}`
const authorization = `Basic ${Buffer.from('admin:local-smoke').toString('base64')}`

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

let baseUrl
async function grafana(path, method = 'GET', body) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!response.ok) {
    throw new Error(
      `${method} ${path}: HTTP ${response.status}: ${await response.text()}`
    )
  }
  return response.json()
}

try {
  await docker([
    'run',
    '-d',
    '--name',
    containerName,
    '-e',
    'GF_SECURITY_ADMIN_PASSWORD=local-smoke',
    '-p',
    '127.0.0.1::3000',
    'grafana/grafana:13.1.0'
  ])
  const address = await docker(['port', containerName, '3000/tcp'])
  const port = Number(address.match(/:(\d+)$/)?.[1])
  if (!port) throw new Error('Could not resolve Grafana port')
  baseUrl = `http://127.0.0.1:${port}`

  let ready = false
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      await grafana('/api/org')
      ready = true
      break
    } catch {
      await delay(250)
    }
  }
  if (!ready) throw new Error('Grafana did not become ready')

  for (const datasource of [
    {
      name: 'smoke-prometheus',
      type: 'prometheus',
      uid: 'smoke-prom',
      url: 'http://127.0.0.1:9090'
    },
    {
      name: 'smoke-loki',
      type: 'loki',
      uid: 'smoke-loki',
      url: 'http://127.0.0.1:3100'
    }
  ]) {
    await grafana('/api/datasources', 'POST', {
      ...datasource,
      access: 'proxy'
    })
  }

  const files = (await readdir(join(directory, 'dashboards'))).filter(name =>
    name.endsWith('.json')
  )
  for (const file of files) {
    const source = await readFile(join(directory, 'dashboards', file), 'utf8')
    const dashboard = JSON.parse(source, (_key, value) => {
      if (value === '__PROMETHEUS_UID__') return 'smoke-prom'
      if (value === '__LOKI_UID__') return 'smoke-loki'
      return value
    })
    await grafana('/api/dashboards/db', 'POST', { dashboard, overwrite: true })
    const imported = await grafana(`/api/dashboards/uid/${dashboard.uid}`)
    if (imported.dashboard.panels.length !== dashboard.panels.length) {
      throw new Error(`Panel count changed during import: ${file}`)
    }
    console.log(`Imported ${dashboard.uid}: ${dashboard.panels.length} panels`)
  }
} finally {
  await docker(['rm', '-f', containerName]).catch(() => {})
}
