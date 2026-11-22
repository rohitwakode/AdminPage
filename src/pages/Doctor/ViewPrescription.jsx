import { useContext, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { AppContext } from '../../context/AppContext'
import { DoctorContext } from '../../context/DoctorContext'

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

const PrescriptionSection = ({ number, title, description, details, fields }) => {
  const entries = fields
    .map((key) => [key, details?.[key]])
    .filter(([, value]) => value !== null && value !== undefined && value !== '')

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
          {number}
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {entries.length ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {formatLabel(key)}
              </dt>
              <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
          No details were recorded in this section.
        </p>
      )}
    </section>
  )
}

PrescriptionSection.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  details: PropTypes.object,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired
}

const ViewPrescription = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { dToken, appointments, appointmentsLoading, getAppointments } = useContext(DoctorContext)
  const { slotDateFormat } = useContext(AppContext)

  const appointment =
    location.state?.appointment ||
    appointments.find((item) => String(item.id ?? item._id) === id)
  const returnTo =
    location.state?.returnTo === '/doctor-dashboard'
      ? '/doctor-dashboard'
      : '/doctor-appointments'
  const prescription = appointment?.prescription || {}
  const knownFields = [
    'diagnosis',
    'symptoms',
    'clinicalNotes',
    'bloodPressure',
    'temperature',
    'medicine',
    'advice'
  ]
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

  useEffect(() => {
    if (!location.state?.appointment && dToken) getAppointments()
  }, [dToken, getAppointments, location.state?.appointment])

  const goBack = () => navigate(returnTo)

  if (!appointment) {
    return (
      <main className="workspace-page min-h-screen">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={goBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <span aria-hidden="true">←</span> Back to appointments
          </button>
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">
              {appointmentsLoading ? 'Loading prescription…' : 'Appointment not found'}
            </h1>
            {!appointmentsLoading && (
              <p className="mt-2 text-sm text-slate-500">
                This appointment may have been removed or is no longer available.
              </p>
            )}
          </section>
        </div>
      </main>
    )
  }

  const patient = appointment.patient || appointment.userData || {}
  const patientName = patient.name || 'Patient'
  const patientInitials = patientName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <main className="workspace-page min-h-screen">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <span aria-hidden="true">←</span> Back to appointments
          </button>
        </div>

        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="workspace-eyebrow">PATIENT VISIT / CLINICAL RECORD</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Prescription
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Visit summary and prescribed care for this appointment.
          </p>
        </header>

        <section className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-base font-bold text-blue-700">
            {patient.image ? (
              <img src={patient.image} alt="" className="h-full w-full object-cover" />
            ) : (
              patientInitials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">
              {patientName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Appointment #{appointment.id ?? appointment._id ?? id}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Appointment date</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {appointment.slotDate && slotDateFormat
                ? slotDateFormat(appointment.slotDate)
                : appointment.slotDate || 'Date unavailable'}
              {appointment.slotTime ? ` · ${appointment.slotTime}` : ''}
            </p>
          </div>
        </section>

        <div className="space-y-5">
          <PrescriptionSection
            number="01"
            title="Visit assessment"
            description="Diagnosis and clinical notes from the appointment."
            details={prescription}
            fields={['diagnosis', 'symptoms', 'clinicalNotes']}
          />
          <PrescriptionSection
            number="02"
            title="Vitals"
            description="Observations recorded during the visit."
            details={prescription}
            fields={['bloodPressure', 'temperature']}
          />
          <PrescriptionSection
            number="03"
            title="Treatment plan"
            description="Medication and advice for ongoing care."
            details={prescription}
            fields={['medicine', 'advice']}
          />
          {Object.keys(additionalDetails).length > 0 && (
            <PrescriptionSection
              number="04"
              title="Additional information"
              description="Other details saved with this clinical record."
              details={additionalDetails}
              fields={Object.keys(additionalDetails)}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default ViewPrescription
