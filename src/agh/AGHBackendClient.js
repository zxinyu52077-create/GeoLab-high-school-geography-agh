export async function getAGHBackendStatus() {
  const response = await fetch('/api/agh/status', { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`GeoLab BFF 返回 HTTP ${response.status}`)
  return response.json()
}

export async function runGeoLabThroughBackend({ experimentId, question, params, pageState }) {
  const response = await fetch('/api/agh/experiments/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ experimentId, question, params, pageState }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.ok) throw new Error(payload.error || `GeoLab BFF 返回 HTTP ${response.status}`)
  return payload
}

export function normalizeAGHEvidence(rawResult) {
  const result = typeof rawResult === 'string' ? JSON.parse(rawResult) : (rawResult || {})
  const rawRows = Array.isArray(result.rows) ? result.rows : []
  const objectRow = rawRows.find((row) => row && typeof row === 'object' && !Array.isArray(row))
  const columns = result.columns || (objectRow ? Object.keys(objectRow) : rawRows[0]?.map((_, index) => `数据${index + 1}`) || [])
  const rows = rawRows.map((row) => Array.isArray(row) ? row : columns.map((column) => row?.[column]))
  const metrics = result.metrics || (objectRow ? Object.entries(objectRow).slice(0, 4).map(([label, value]) => ({ label, value: String(value) })) : [])
  return {
    ...result,
    columns,
    rows,
    metrics,
    checks: Array.isArray(result.checks) ? result.checks : (Array.isArray(result.verification) ? result.verification : []),
    summary: result.summary || 'AGH 已返回结构化实验结果。',
  }
}

