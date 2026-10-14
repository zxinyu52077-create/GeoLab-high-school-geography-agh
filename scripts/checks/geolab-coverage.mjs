import {
  getGeoSimExperimentCatalog,
  getGeoSimExperimentDefaults,
  runGeoSimExperiment,
} from '../../src/agh/GeoSimExperimentEngine.js'

const catalog = getGeoSimExperimentCatalog()
const failures = []

if (catalog.length !== 16) {
  failures.push(`实验注册数量应为 16，实际为 ${catalog.length}`)
}

for (const experiment of catalog) {
  const result = runGeoSimExperiment(experiment.id, getGeoSimExperimentDefaults(experiment.id))
  if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
    failures.push(`${experiment.id} 没有返回数据行`)
  }
  if (!Array.isArray(result.checks) || result.checks.length < 3) {
    failures.push(`${experiment.id} 验证项少于 3 项`)
  }
  if (result.checks?.some((check) => !check.ok)) {
    failures.push(`${experiment.id} 默认参数未通过全部验证`)
  }
}

const boundary = runGeoSimExperiment('required-01', { distance: 10, atmosphere: false, liquidWater: false, shielding: false })
if (boundary.checks.every((check) => check.ok)) {
  failures.push('required-01 越界样例没有触发验证告警')
}

const invalid = runGeoSimExperiment('required-07', { rain: -1, vegetation: 50, urban: 120 })
if (invalid.checks.every((check) => check.ok)) {
  failures.push('required-07 非法输入没有触发验证告警')
}

if (failures.length) {
  console.error('GeoLab coverage check failed')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`GeoLab coverage check passed: ${catalog.length} experiments, normal/boundary/invalid samples verified.`)
}
