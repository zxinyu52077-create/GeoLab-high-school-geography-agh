export function apply(ctx) {
  const register = (label) => ctx.slots.register('ui:sidebar', () => label, { priority: -2 })
  const services = ctx.agnes?.services
  if (!services) {
    register('GeoLab 地理工具 · 未连接')
    return
  }
  void services.call('geolab.experiment.status', {})
    .then((result) => register(`GeoLab 地理工具 · ${result?.tool || '已连接'}`))
    .catch(() => register('GeoLab 地理工具 · unavailable'))
}

