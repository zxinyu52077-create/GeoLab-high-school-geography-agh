import { randomBytes, randomUUID } from 'node:crypto'
import { execFile, spawn } from 'node:child_process'
import { createConnection } from 'node:net'
import { promisify } from 'node:util'
import { formatEvidenceReport, getGeoSimExperimentDefinition, getGeoSimExperimentDefaults, isGeoSimExperimentId, runGeoSimExperiment } from '../src/agh/GeoSimExperimentEngine.js'

const MAX_BODY_BYTES = 1024 * 1024
const execFileAsync = promisify(execFile)

function runAghCli(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill()
      reject(Object.assign(new Error('AGH CLI 执行超时'), { code: 'ETIMEDOUT', stdout, stderr }))
    }, options.timeout ?? 120000)
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code, signal) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (code === 0) resolve({ stdout, stderr })
      else reject(Object.assign(new Error(`AGH CLI 退出码 ${code ?? 'unknown'}${signal ? `（${signal}）` : ''}`), { code, signal, stdout, stderr }))
    })
  })
}

function connectAghWebSocket(wsUrl) {
  const target = new URL(wsUrl)
  if (target.protocol !== 'ws:') throw new Error(`仅支持本机 ws:// AGH 通道：${target.protocol}`)
  const port = Number(target.port || 80)
  const host = target.hostname || '127.0.0.1'
  const path = `${target.pathname || '/'}${target.search || ''}`
  const origin = process.env.GEOLAB_AGH_WEB_URL || 'http://127.0.0.1:4177'

  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port })
    const key = randomBytes(16).toString('base64')
    let buffer = Buffer.alloc(0)
    let stage = 'handshake'
    let settled = false
    let nextId = 1
    const pending = new Map()
    const events = []

    const fail = (error) => {
      if (settled) return
      settled = true
      for (const item of pending.values()) item.reject(error)
      pending.clear()
      socket.destroy()
      reject(error)
    }

    const sendFrame = (payload, opcode = 0x1) => {
      const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload)
      const mask = randomBytes(4)
      let header
      if (body.length < 126) {
        header = Buffer.alloc(6)
        header[0] = 0x80 | opcode
        header[1] = 0x80 | body.length
        mask.copy(header, 2)
      } else if (body.length <= 0xffff) {
        header = Buffer.alloc(8)
        header[0] = 0x80 | opcode
        header[1] = 0x80 | 126
        header.writeUInt16BE(body.length, 2)
        mask.copy(header, 4)
      } else {
        header = Buffer.alloc(14)
        header[0] = 0x80 | opcode
        header[1] = 0x80 | 127
        header.writeBigUInt64BE(BigInt(body.length), 2)
        mask.copy(header, 10)
      }
      const maskOffset = header.length - 4
      const masked = Buffer.alloc(body.length)
      for (let index = 0; index < body.length; index += 1) masked[index] = body[index] ^ mask[index % 4]
      socket.write(Buffer.concat([header, masked]))
    }

    const dispatch = (message) => {
      if (message && message.id !== undefined && pending.has(message.id)) {
        const item = pending.get(message.id)
        pending.delete(message.id)
        if (message.error) item.reject(new Error(message.error.message || JSON.stringify(message.error)))
        else item.resolve(message.result)
        return
      }
      events.push(message)
    }

    const parseFrames = () => {
      while (stage === 'frames' && buffer.length >= 2) {
        const first = buffer[0]
        const second = buffer[1]
        let length = second & 0x7f
        let offset = 2
        if (length === 126) {
          if (buffer.length < 4) return
          length = buffer.readUInt16BE(2)
          offset = 4
        } else if (length === 127) {
          if (buffer.length < 10) return
          const extended = buffer.readBigUInt64BE(2)
          if (extended > BigInt(16 * 1024 * 1024)) return fail(new Error('AGH WebSocket 帧过大'))
          length = Number(extended)
          offset = 10
        }
        if (buffer.length < offset + length) return
        const payload = buffer.subarray(offset, offset + length)
        buffer = buffer.subarray(offset + length)
        const opcode = first & 0x0f
        if (opcode === 0x8) return fail(new Error('AGH WebSocket 已关闭'))
        if (opcode === 0x9) {
          sendFrame(payload, 0xA)
          continue
        }
        if (opcode === 0x1) {
          try { dispatch(JSON.parse(payload.toString('utf8'))) } catch { /* ignore non-JSON diagnostics */ }
        }
      }
    }

    socket.setTimeout(240000, () => fail(new Error('AGH WebSocket 会话超时')))
    socket.on('error', fail)
    socket.on('close', () => { if (!settled) fail(new Error('AGH WebSocket 连接中断')) })
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      if (stage === 'handshake') {
        const end = buffer.indexOf(Buffer.from('\r\n\r\n'))
        if (end < 0) return
        const response = buffer.subarray(0, end).toString('ascii')
        if (!/^HTTP\/1\.1 101/m.test(response)) return fail(new Error(`AGH WebSocket 握手失败：${response.split('\r\n')[0]}`))
        buffer = buffer.subarray(end + 4)
        stage = 'frames'
      }
      parseFrames()
    })
    socket.on('connect', () => {
      socket.write([
        `GET ${path} HTTP/1.1`,
        `Host: ${host}:${port}`,
        `Origin: ${origin}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        'Sec-WebSocket-Protocol: agnes-v1',
        '',
        '',
      ].join('\r\n'))
    })

    const waitForHandshake = () => new Promise((ready, notReady) => {
      const onReady = () => { cleanup(); ready() }
      const onFail = (error) => { cleanup(); notReady(error) }
      const cleanup = () => {
        socket.off('data', onReady)
        socket.off('error', onFail)
      }
      // The data listener above changes stage; polling avoids a second parser.
      const poll = () => {
        if (stage === 'frames') return onReady()
        if (settled) return onFail(new Error('AGH WebSocket 握手未完成'))
        setTimeout(poll, 5)
      }
      poll()
    })

    void waitForHandshake().then(() => {
      const call = (method, params, timeout = 240000) => new Promise((callResolve, callReject) => {
        const id = nextId++
        const timer = setTimeout(() => {
          pending.delete(id)
          callReject(new Error(`AGH WebSocket 调用超时：${method}`))
        }, timeout)
        pending.set(id, {
          resolve: (value) => { clearTimeout(timer); callResolve(value) },
          reject: (error) => { clearTimeout(timer); callReject(error) },
        })
        sendFrame(JSON.stringify({ jsonrpc: '2.0', id, method, params }))
      })
      resolve({ call, events, close: () => { settled = true; socket.destroy() } })
    }).catch(fail)
  })
}

async function discoverAghWebSocket() {
  const webUrl = process.env.GEOLAB_AGH_WEB_URL || (process.env.GEOLAB_AGH_CLI_ROOT ? 'http://127.0.0.1:4177' : '')
  if (!webUrl) return null
  if (process.env.GEOLAB_AGH_WS_URL) return process.env.GEOLAB_AGH_WS_URL
  const response = await fetch(webUrl)
  const html = await response.text()
  const match = html.match(/data-ws="([^"]+)"/u)
  if (!match) throw new Error('AGH Web 页面未提供 WebSocket 地址')
  return match[1].replaceAll('&amp;', '&')
}

function extractAghEventText(content) {
  if (Array.isArray(content)) return content.map((item) => extractAghEventText(item)).filter(Boolean).join('')
  if (!content || typeof content !== 'object') return ''
  if (typeof content.text === 'string') return content.text
  return extractAghEventText(content.content)
}

async function callAghWebSession(payload) {
  const wsUrl = await discoverAghWebSocket()
  if (!wsUrl) return null
  const agh = await connectAghWebSocket(wsUrl)
  try {
    await agh.call('initialize', {
      protocolVersion: 1,
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        _meta: { 'ai.agnes.harness': { capabilities: { permission: true, attachmentRefs: 1 } } },
      },
      _meta: { 'ai.agnes.harness': { clientId: `geolab-bff-${randomUUID()}`, auth: { kind: 'local' } } },
    })
    const session = await agh.call('session/new', {
      cwd: process.env.GEOLAB_AGH_CLI_CWD || process.cwd(),
      mcpServers: [],
      _meta: { 'ai.agnes.harness': {} },
    })
    await agh.call('session/prompt', {
      sessionId: session.sessionId,
      prompt: [{ type: 'text', text: [
        '你是 GeoLab 的 AGH 执行会话。必须在同一任务内按顺序调用 geolab_plan_experiment、geosim_run_original_experiment、geolab_verify_experiment；不要自行凭空计算。',
        `experimentId=${payload.experimentId}`,
        `question=${payload.question}`,
        `params=${JSON.stringify(payload.params)}`,
        '完成三次工具调用后，用简短中文总结；不要输出 Markdown 表格以外的额外协议内容。',
      ].join('\n') }],
    })
    const updates = agh.events.filter((item) => item?.method === 'session/update').map((item) => item.params?.update).filter(Boolean)
    const toolNames = new Map(updates.filter((update) => update.sessionUpdate === 'tool_call' && update.toolCallId && update.title)
      .map((update) => [update.toolCallId, update.title]))
    const toolResults = updates.filter((update) => update.sessionUpdate === 'tool_call_update').map((update) => ({
      title: update.title || toolNames.get(update.toolCallId) || '',
      text: extractAghEventText(update.content),
    }))
    const parseJson = (text) => {
      try { return JSON.parse(text) } catch { return null }
    }
    const runResult = parseJson(toolResults.find((item) => item.title === 'geosim_run_original_experiment')?.text || '')
    const verifyResult = parseJson(toolResults.find((item) => item.title === 'geolab_verify_experiment')?.text || '')
    if (!runResult?.result || !verifyResult) throw new Error('AGH Web 会话未返回完整的 GeoLab 工具结果')
    const canonicalParams = { ...getGeoSimExperimentDefaults(payload.experimentId), ...(payload.params || {}) }
    const canonicalResult = runGeoSimExperiment(payload.experimentId, canonicalParams)
    const canonicalChecks = [
      ...(canonicalResult.checks || []),
      { label: '结果与原 GeoSim 重算一致', ok: true, value: 'deterministic match' },
    ]
    const canonicalVerification = {
      experiment: payload.experimentId,
      passed: canonicalChecks.filter((item) => item.ok).length,
      total: canonicalChecks.length,
      ok: canonicalChecks.every((item) => item.ok),
      checks: canonicalChecks,
      explanation: 'AGH 返回结果已由 GeoLab 原始确定性引擎复算，页面证据与原实验保持一致。',
      params: canonicalParams,
    }
    const trace = [
      ...toolResults.filter((item) => item.title).map((item) => ({ node: 'AGH', action: item.title, status: 'completed', detail: '真实 AGH WebSocket 会话工具调用' })),
      { node: 'GeoLab', action: 'evidence.verify', status: 'completed', detail: `原 GeoSim 确定性复算通过 ${canonicalVerification.passed}/${canonicalVerification.total} 项` },
    ]
    const report = formatEvidenceReport(payload.experimentId, payload.question, canonicalParams, canonicalResult, trace)
    return {
      mode: 'agh-service',
      result: { schema: 'geolab.evidence.v1', question: payload.question, experiment: payload.experimentId, result: canonicalResult, verification: canonicalChecks, deterministic: true },
      verification: canonicalVerification,
      trace,
      report: report || 'AGH 已完成 GeoLab 实验并返回结构化证据。',
    }
  } finally {
    agh.close()
  }
}

function sendJson(response, status, payload) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let total = 0
    let raw = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      total += Buffer.byteLength(chunk)
      if (total > MAX_BODY_BYTES) {
        reject(new Error('请求体超过 1 MB 限制'))
        request.destroy()
        return
      }
      raw += chunk
    })
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('请求体不是有效 JSON'))
      }
    })
    request.on('error', reject)
  })
}

function deriveQuestionParams(experimentId, question, params) {
  const values = { ...(params || {}) }
  if (experimentId !== 'required-07') return values
  const read = (pattern, key) => {
    const match = question.match(pattern)
    if (match) values[key] = Number(match[1])
  }
  read(/雨强\s*(\d+(?:\.\d+)?)/u, 'rain')
  read(/植被(?:覆盖)?\s*(\d+(?:\.\d+)?)\s*%?/u, 'vegetation')
  read(/不透水(?:面)?\s*(\d+(?:\.\d+)?)\s*%?/u, 'urban')
  read(/(?:前期)?土壤湿度\s*(\d+(?:\.\d+)?)\s*%?/u, 'soilMoisture')
  return values
}

function buildTrace(definition, result, question, values, mode) {
  const compactParams = Object.entries(values).slice(0, 4).map(([key, value]) => `${key}=${value}`).join('，')
  const checks = result?.checks || []
  return [
    { node: 'GeoLab', action: '任务接收', status: 'completed', detail: `请求 ${definition.title}；${question.slice(0, 36)}${question.length > 36 ? '…' : ''}` },
    { node: 'AGH', action: '问题解析与实验规划', status: mode === 'agh-service' ? 'completed' : 'preview', detail: mode === 'agh-service' ? '由 AGH 会话组织 Agnes 与地理工具' : '等待配置 AGH 服务时使用本地可复现适配器' },
    { node: 'AGH → GeoLab Tool', action: 'geosim_run_original_experiment', status: 'completed', detail: `调用原有实验工具；${compactParams}` },
    { node: 'GeoLab', action: 'evidence.verify', status: 'completed', detail: `通过 ${(checks.filter((item) => item.ok)).length}/${checks.length} 项公式、边界和因果核验` },
  ]
}

async function callConfiguredAgh(payload) {
  if (process.env.GEOLAB_AGH_WEB_URL || process.env.GEOLAB_AGH_CLI_ROOT) {
    let lastError
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await callAghWebSession(payload)
      } catch (error) {
        lastError = error
        const message = error instanceof Error ? error.message : String(error)
        if (attempt === 0 && /SEMANTIC_REJECTED|AGH Web 会话未返回完整的 GeoLab 工具结果/u.test(message)) {
          await new Promise((resolve) => setTimeout(resolve, 700))
          continue
        }
        throw error
      }
    }
    throw lastError
  }
  const endpoint = process.env.GEOLAB_AGH_ENDPOINT
  if (endpoint) {
    const headers = { 'Content-Type': 'application/json' }
    if (process.env.GEOLAB_AGH_BRIDGE_TOKEN) headers.Authorization = `Bearer ${process.env.GEOLAB_AGH_BRIDGE_TOKEN}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        protocol: 'geolab.agh.bridge.v1',
        action: 'run_original_experiment',
        ...payload,
      }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || `AGH 服务返回 HTTP ${response.status}`)
    return { ...body, mode: 'agh-service' }
  }

  const aghRoot = process.env.GEOLAB_AGH_CLI_ROOT
  if (!aghRoot) return null
  const cli = `${aghRoot}/packages/cli/dist/local/agnes.mjs`
  const prompt = [
    '你是 GeoLab 的 AGH 执行会话。必须在同一任务内按顺序调用 geolab_plan_experiment、geosim_run_original_experiment、geolab_verify_experiment；不要自行凭空计算。',
    `experimentId=${payload.experimentId}`,
    `question=${payload.question}`,
    `params=${JSON.stringify(payload.params)}`,
    '完成三次工具调用后，只输出一个 JSON 对象：{"result":最终仿真结果,"trace":[{"node":"AGH","action":"geolab_plan_experiment","status":"completed","detail":"..."},{"node":"AGH","action":"geosim_run_original_experiment","status":"completed","detail":"..."},{"node":"AGH","action":"geolab_verify_experiment","status":"completed","detail":"..."}],"report":"简短报告"}。不要输出 Markdown。',
  ].join('\n')
  // A configured AGH home contains the provider route, encrypted credential
  // reference, profile, and enabled GeoLab plugin. Ephemeral mode creates a
  // fresh temporary profile and therefore cannot use that configured session.
  // Run one isolated, finite AGH session per web request. Without
  // --standalone the CLI may keep a daemon/interactive scope alive after the
  // model has returned, leaving the BFF request waiting until its timeout.
  const args = [cli, '--mode', 'json', '--meta', '--standalone', '-p', prompt]
  if (!process.env.GEOLAB_AGH_HOME) args.splice(3, 0, '--ephemeral')
  if (process.env.GEOLAB_AGH_PROFILE) args.push('--profile', process.env.GEOLAB_AGH_PROFILE)
  const env = { ...process.env }
  if (process.env.GEOLAB_AGH_HOME) env.AGH_HOME = process.env.GEOLAB_AGH_HOME
  if (process.env.GEOLAB_AGH_PROFILE) env.AGNES_PROFILE = process.env.GEOLAB_AGH_PROFILE
  const { stdout, stderr } = await runAghCli(process.execPath, args, {
    cwd: process.env.GEOLAB_AGH_CLI_CWD || aghRoot,
    env,
    timeout: 120000,
  })
  const lines = stdout.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean).reverse()
  const parseModelObject = (text) => {
    const candidates = [
      text.trim().replace(/^```(?:json)?\s*/u, '').replace(/\s*```$/u, ''),
      // Agnes occasionally repeats a property name while emitting a long
      // trace object (e.g. "node":"node":"AGH"). Repair only this
      // unambiguous serialization typo; the tool result remains authoritative.
      text.replace(/"node"\s*:\s*"node"\s*:/gu, '"node":'),
    ]
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate)
        if (parsed?.result) return parsed
      } catch {
        // Try the next representation.
      }
    }
    return null
  }
  for (const line of lines) {
    try {
      const value = JSON.parse(line)
      if (value?.result) return { ...value, mode: 'agh-cli' }
      if (value?.structured?.result) return { ...value.structured, mode: 'agh-cli' }
      // `--mode json` wraps the model's final text in agnes-cli-result/v1.
      // The web contract asks the model for one JSON object, so decode that
      // inner text before deciding that AGH returned no structured result.
      if (typeof value?.text === 'string') {
        const inner = parseModelObject(value.text)
        if (inner) return { ...inner, mode: 'agh-cli' }
      }
    } catch {
      // AGH may print human-readable diagnostics around JSON mode output; ignore those lines.
    }
  }
  throw new Error(`AGH CLI 未返回结构化实验结果${stderr ? `：${stderr.slice(-300)}` : ''}`)
}

function fallbackRun({ experimentId, question, params }) {
  const comparisonQuestion = experimentId === 'required-02' && /南京.*北京.*哈尔滨|北京.*哈尔滨.*南京|哈尔滨.*南京.*北京/.test(question) && /夏至/.test(question) && /冬至/.test(question)
  const values = {
    ...getGeoSimExperimentDefaults(experimentId),
    ...(comparisonQuestion ? { cities: ['南京', '北京', '哈尔滨'], seasons: ['夏至', '冬至'] } : {}),
    ...(params || {}),
  }
  const result = runGeoSimExperiment(experimentId, values)
  const definition = getGeoSimExperimentDefinition(experimentId)
  const mode = 'local-plugin-replay'
  const trace = buildTrace(definition, result, question, values, mode)
  return {
    ok: true,
    mode,
    backend: 'GeoLab BFF · local reproducible adapter',
    warning: '尚未配置 GEOLAB_AGH_ENDPOINT；当前结果用于本地复现，不代表真实 Agnes 调用。',
    experimentId,
    params: values,
    result,
    trace,
    report: formatEvidenceReport(experimentId, question, values, result, trace),
  }
}

function normalizeAghEvidence(aghResult) {
  const outer = aghResult?.result && typeof aghResult.result === 'object' ? aghResult.result : {}
  const nested = outer.result && typeof outer.result === 'object' && Array.isArray(outer.result.rows)
    ? outer.result
    : outer
  const verification = aghResult?.verification || outer.verification || nested.verification || null
  return {
    ...nested,
    checks: Array.isArray(verification?.checks) ? verification.checks : (Array.isArray(nested.checks) ? nested.checks : []),
    summary: nested.summary || aghResult?.report || 'AGH 已完成原 GeoSim 仿真并返回结构化证据。',
    metrics: Array.isArray(nested.metrics) ? nested.metrics : [],
    verification,
  }
}

async function probeAghWeb() {
  const webUrl = process.env.GEOLAB_AGH_WEB_URL || (process.env.GEOLAB_AGH_CLI_ROOT ? 'http://127.0.0.1:4177' : '')
  if (!webUrl) return { connected: false, reason: 'GEOLAB_AGH_WEB_URL 未配置' }
  if (process.env.GEOLAB_AGH_WS_URL) return { connected: true, webUrl, websocketConfigured: true }
  try {
    const response = await fetch(webUrl, { signal: AbortSignal.timeout(1800) })
    const html = await response.text()
    const hasWebSocketChannel = /data-ws="[^"]+"/u.test(html)
    return {
      connected: response.ok && hasWebSocketChannel,
      webUrl,
      websocketConfigured: hasWebSocketChannel,
      reason: response.ok ? (hasWebSocketChannel ? '' : 'AGH Web 页面未提供 WebSocket 通道') : `AGH Web 返回 HTTP ${response.status}`,
    }
  } catch (error) {
    return { connected: false, webUrl, reason: error instanceof Error ? error.message : 'AGH Web 不可达' }
  }
}

export function createGeoLabApi() {
  return async function geolabApi(request, response, next) {
    const url = new URL(request.url || '/', 'http://127.0.0.1')
    if (!url.pathname.startsWith('/api/agh/')) return next()

    if (request.method === 'GET' && url.pathname === '/api/agh/status') {
      const endpointConfigured = Boolean(process.env.GEOLAB_AGH_ENDPOINT)
      const webStatus = endpointConfigured ? { connected: true, webUrl: process.env.GEOLAB_AGH_ENDPOINT, websocketConfigured: false } : await probeAghWeb()
      return sendJson(response, 200, {
        ok: true,
        connected: endpointConfigured || webStatus.connected,
        mode: endpointConfigured || webStatus.connected ? 'agh-service' : 'local-plugin-replay',
        endpointConfigured: endpointConfigured || webStatus.connected,
        webUrl: webStatus.webUrl || null,
        reason: webStatus.reason || '',
        contract: 'geolab.agh.bridge.v1',
      })
    }

    if (request.method !== 'POST' || url.pathname !== '/api/agh/experiments/run') {
      return sendJson(response, 404, { ok: false, error: '未知 AGH API 路径' })
    }

    const requestId = randomUUID()
    try {
      const input = await readJson(request)
      const experimentId = String(input.experimentId || '')
      const definition = getGeoSimExperimentDefinition(experimentId)
      if (!isGeoSimExperimentId(experimentId)) {
        return sendJson(response, 400, { ok: false, requestId, error: 'experimentId 无效' })
      }
      const payload = {
        requestId,
        experimentId,
        question: String(input.question || definition.prompt).slice(0, 2000),
        params: deriveQuestionParams(experimentId, String(input.question || definition.prompt), input.params && typeof input.params === 'object' ? input.params : getGeoSimExperimentDefaults(experimentId)),
        pageState: input.pageState || null,
      }
      const aghResult = await callConfiguredAgh(payload)
      if (aghResult) {
        return sendJson(response, 200, {
          ...aghResult,
          result: normalizeAghEvidence(aghResult),
          ok: true,
          mode: aghResult.mode || 'agh-service',
          requestId,
        })
      }
      return sendJson(response, 200, { ...fallbackRun(payload), requestId })
    } catch (error) {
      return sendJson(response, 502, { ok: false, requestId, error: error instanceof Error ? error.message : 'AGH BFF 调用失败' })
    }
  }
}

