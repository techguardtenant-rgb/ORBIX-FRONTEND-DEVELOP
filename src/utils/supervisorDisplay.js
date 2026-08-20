/** Correo del supervisor en una bitácora (normalizado). */
export function supervisorEmailDe(bitacora) {
  if (!bitacora) return ''
  const direct = (bitacora.supervisorEmail || '').trim()
  if (direct) return direct
  const s = String(bitacora.supervisor || '').trim()
  return s.includes('@') ? s : ''
}

/** Nombre del supervisor (desde API o campo legacy sin @). */
export function supervisorNombreDe(bitacora) {
  if (!bitacora) return ''
  const nombre = (bitacora.nombreSupervisor || '').trim()
  if (nombre) return nombre
  const s = String(bitacora.supervisor || '').trim()
  return s && !s.includes('@') ? s : ''
}

/** Etiqueta para selects: "Nombre Apellido (correo@...)". */
export function supervisorEtiquetaUsuario(usuario) {
  const email = (usuario?.email || usuario?.Email || '').trim()
  const nombre = (
    usuario?.name ||
    usuario?.FullName ||
    [usuario?.GivenName, usuario?.FamilyName].filter(Boolean).join(' ') ||
    ''
  ).trim()
  if (nombre && email) return `${nombre} (${email})`
  return nombre || email || '—'
}
