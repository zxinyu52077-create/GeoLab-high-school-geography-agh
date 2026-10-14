import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const mode = process.argv[2] || 'dev'
const extraArgs = process.argv.slice(3)
const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const localAghWorkspace = join(process.cwd(), 'tmp', 'agnes-harness-src', 'agnes-harness-main')

// Keep credentials in the private AGH profile. This only supplies the local
// Web bridge address to the GeoLab BFF; it never carries a model key.
const env = {
  ...process.env,
  GEOLAB_AGH_WEB_URL: process.env.GEOLAB_AGH_WEB_URL || 'http://127.0.0.1:4177',
  ...(process.env.GEOLAB_AGH_CLI_CWD
    ? { GEOLAB_AGH_CLI_CWD: process.env.GEOLAB_AGH_CLI_CWD }
    : existsSync(localAghWorkspace)
      ? { GEOLAB_AGH_CLI_CWD: localAghWorkspace }
      : {}),
}

const child = spawn(process.execPath, [viteBin, mode, ...extraArgs], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
  windowsHide: false,
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 1)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
