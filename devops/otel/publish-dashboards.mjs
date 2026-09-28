import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = join(dirname(fileURLToPath(import.meta.url)), 'dashboards')
const checkOnly = process.argv.includes('--check')
const required = [
  'GRAFANA_URL',
  'GRAFANA_SERVICE_ACCOUNT_TOKEN',
  'GRAFANA_PROMETHEUS_DATASOURCE_UID',
  'GRAFANA_LOKI_DATASOURCE_UID'
]
const missing = required.filter(key => !process.env[key])
if (!checkOnly && missing.length) {
  throw new Error(`Missing dashboard configuration: ${missing.join(', ')}`)
}

const baseUrl = checkOnly ? null : new URL(process.env.GRAFANA_URL)
if (baseUrl && baseUrl.protocol !== 'https:') {
  throw new Error('GRAFANA_URL must use HTTPS')
}

const replacements = {
  __PROMETHEUS_UID__: process.env.GRAFANA_PROMETHEUS_DATASOURCE_UID,
  __LOKI_UID__: process.env.GRAFANA_LOKI_DATASOURCE_UID
}

for (const filename of (await readdir(directory)).filter(name =>
  name.endsWith('.json')
)) {
  const source = await readFile(join(directory, filename), 'utf8')
  const dashboard = JSON.parse(source, (_key, value) =>
    typeof value === 'string' && replacements[value]
      ? replacements[value]
      : value
  )
  if (!dashboard.uid || !dashboard.title || !dashboard.panels?.length) {
    throw new Error(`Invalid dashboard: ${filename}`)
  }
  if (checkOnly) {
    console.log(`Validated ${dashboard.uid}`)
    continue
  }
  const response = await fetch(new URL('/api/dashboards/db', baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dashboard,
      overwrite: true,
      ...(process.env.GRAFANA_FOLDER_UID
        ? { folderUid: process.env.GRAFANA_FOLDER_UID }
        : {})
    })
  })
  if (!response.ok) {
    throw new Error(`Dashboard ${filename} failed: HTTP ${response.status}`)
  }
  console.log(`Published ${dashboard.uid}`)
}
