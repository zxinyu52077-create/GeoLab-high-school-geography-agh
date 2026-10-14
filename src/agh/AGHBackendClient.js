import { formatEvidenceReport, getGeoSimExperimentDefinition, runGeoSimExperiment } from './GeoSimExperimentEngine'

export async function getAGHBackendStatus() {
  try {
    const response = await fetch('/api/agh/status', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`GeoLab BFF 返回 HTTP ${response.status}`)
    return response.json()
  } catch (error) {
    return { connected: false, mode: 'local-preview', reason: error instanceof Error ? error.message : '在线后台不可达' }
  }
}

export async function runGeoLabThroughBackend({ experimentId, question, params, pageState }) {
  try {
    const response = await fetch('/api/agh/experiments/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ experimentId, question, params, pageState }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.ok) throw new Error(payload.error || `GeoLab BFF 返回 HTTP ${response.status}`)
    return payload
  } catch (error) {
    const definition = getGeoSimExperimentDefinition(experimentId)
    const localParams = { ...definition.defaults, ...(params || {}) }
    const result = runGeoSimExperiment(experimentId, localParams)
    const trace = [
      { node: 'GeoLab', action: 'local_adapter.plan', status: 'completed', detail: '在线AGH不可达，使用本地可复现适配器生成演示方案' },
      { node: 'GeoLab', action: 'local_adapter.run_original_experiment', status: 'completed', detail: `调用 ${definition.title} 的确定性实验适配器` },
      { node: 'GeoLab', action: 'local_adapter.verify', status: 'completed', detail: `通过 ${result.checks.filter((item) => item.ok).length}/${result.checks.length} 项边界与科学核验` },
    ]
    return {
      ok: true,
      mode: 'local-preview',
      fallbackReason: error instanceof Error ? error.message : '在线AGH不可达',
      params: localParams,
      result,
      trace,
      report: formatEvidenceReport(experimentId, question, localParams, result, trace),
    }
  }
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

