/** Parsea fechas desde Date, ISO string, timestamp u objetos Mongo { $date }. */
export function parseFlexibleDate(value) {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'object') {
    if (value.$date) {
      const d = new Date(value.$date)
      return Number.isNaN(d.getTime()) ? null : d
    }
    // Objeto vacío (bug legacy API) — ignorar
    if (Object.keys(value).length === 0) return null
  }
  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Valor para input datetime-local (hora local). */
export function toDatetimeLocalValue(date) {
  const d = parseFlexibleDate(date)
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateTimeEs(date) {
  const d = parseFlexibleDate(date)
  if (!d) return '—'
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Solo día (cita programada — el día acordado, sin hora fija de visita). */
export function formatDateOnlyEs(date) {
  const d = parseFlexibleDate(date)
  if (!d) return '—'
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Fecha programada de la visita (siempre la de planificación, no la de hoy). */
export function getFechaProgramadaDeBitacora(bitacora) {
  if (!bitacora) return null
  return parseFlexibleDate(bitacora.fechaProgramada) || parseFlexibleDate(bitacora.fecha)
}

/** Fecha/hora real de cierre de la visita (= fin visita / informe enviado). */
export function getFechaFinVisitaDeBitacora(bitacora) {
  if (!bitacora) return null
  return parseFlexibleDate(bitacora.fechaFin)
}

/** Líneas de control de visita para PDF/admin (sin duplicar fin y «elaborada»). */
export function getLineasControlVisita(bitacora) {
  if (!bitacora) return []
  const lines = []
  const programada = getFechaProgramadaDeBitacora(bitacora)
  if (programada) {
    lines.push({ label: 'Cita programada', value: formatDateOnlyEs(programada) })
  }
  const inicio = parseFlexibleDate(bitacora.fechaInicio)
  if (inicio) {
    lines.push({ label: 'Inicio visita', value: formatDateTimeEs(inicio) })
  }
  const fin = getFechaFinVisitaDeBitacora(bitacora)
  if (fin) {
    lines.push({ label: 'Fin visita', value: formatDateTimeEs(fin) })
  }
  if (inicio && fin) {
    lines.push({ label: 'Duración', value: calcDuracionVisita(inicio, fin) })
  }
  return lines
}

/** Duración legible entre inicio y fin (ej. "1 h 25 min"). */
export function calcDuracionVisita(inicio, fin) {
  const a = parseFlexibleDate(inicio)
  const b = parseFlexibleDate(fin)
  if (!a || !b) return '—'
  let ms = b.getTime() - a.getTime()
  if (ms < 0) ms = 0
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (totalMin === 0) return '< 1 min'
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}
