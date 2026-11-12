import PropTypes from 'prop-types'

const formatLabel = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())

const formatValue = (value) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map(formatValue).join(', ')
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${formatLabel(key)}: ${formatValue(nestedValue)}`)
      .join(' · ')
  }
  return String(value)
}

const DetailSection = ({ eyebrow, title, details, fields }) => {
  const entries = fields
    .map((key) => [key, details?.[key]])
    .filter(([, value]) => value !== null && value !== undefined && value !== '')

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-base font-semibold text-slate-900">{title}</h3>
      </div>
      {entries.length ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5">
              <dt className="text-xs font-medium text-slate-500">{formatLabel(key)}</dt>
              <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-sm text-slate-500">
          No details recorded in this section.
        </p>
      )}
    </section>
  )
}

DetailSection.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  details: PropTypes.object,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired
}

const knownFields = ['diagnosis', 'symptoms', 'clinicalNotes', 'bloodPressure', 'temperature', 'medicine', 'advice']

const AppointmentDetailsModal = ({ appointment, onClose }) => {
  if (!appointment) return null

  const prescription = appointment.prescription || {}
  const additionalDetails = Object.fromEntries(
    Object.entries(prescription).filter(
      ([key, value]) =>
        !knownFields.includes(key) &&
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !/password|token/i.test(key) &&
        typeof value !== 'function'
    )
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-details-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M7 3.75h7l4.25 4.5v12H7a2 2 0 0 1-2-2v-12a2.5 2.5 0 0 1 2-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M14 4v5h4M8.5 13h7M8.5 16.5h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                Clinical record
              </p>
              <h2 id="appointment-details-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Prescription
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {appointment.patient?.name || 'Patient'} <span className="px-1 text-slate-300">·</span>
                Appointment #{appointment.id ?? appointment._id ?? '—'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close appointment details"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(92vh-150px)] space-y-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <DetailSection
            eyebrow="01 / Assessment"
            title="Visit notes"
            details={prescription}
            fields={['diagnosis', 'symptoms', 'clinicalNotes']}
          />
          <DetailSection
            eyebrow="02 / Observations"
            title="Vitals"
            details={prescription}
            fields={['bloodPressure', 'temperature']}
          />
          <DetailSection
            eyebrow="03 / Plan"
            title="Treatment"
            details={prescription}
            fields={['medicine', 'advice']}
          />
          {Object.keys(additionalDetails).length > 0 && (
            <DetailSection
              eyebrow="Additional information"
              title="Other details"
              details={additionalDetails}
              fields={Object.keys(additionalDetails)}
            />
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

AppointmentDetailsModal.propTypes = {
  appointment: PropTypes.object,
  onClose: PropTypes.func.isRequired
}

export default AppointmentDetailsModal
