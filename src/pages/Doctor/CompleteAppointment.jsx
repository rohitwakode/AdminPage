import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { AppContext } from '../../context/AppContext'
import { DoctorContext } from '../../context/DoctorContext'

const initialPrescription = {
  diagnosis: '',
  symptoms: '',
  clinicalNotes: '',
  bloodPressure: '',
  temperature: '',
  medicine: '',
  advice: ''
}

const inputClassName =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'

const PrescriptionField = ({ name, label, multiline = false, rows = 3, ...props }) => {
  const Control = multiline ? 'textarea' : 'input'

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <Control
        name={name}
        rows={multiline ? rows : undefined}
        className={`${inputClassName}${multiline ? ' resize-y' : ''}`}
        {...props}
      />
    </label>
  )
}

PrescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  multiline: PropTypes.bool,
  rows: PropTypes.number
}

const PrescriptionSection = ({ number, title, description, children }) => (
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
    {children}
  </section>
)

PrescriptionSection.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

const CompleteAppointment = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { dToken, appointments, appointmentsLoading, getAppointments, completeAppointment } =
    useContext(DoctorContext)
  const { slotDateFormat } = useContext(AppContext)
  const [prescription, setPrescription] = useState(initialPrescription)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const appointment =
    location.state?.appointment ||
    appointments.find((item) => String(item.id ?? item._id) === id)
  const returnTo =
    location.state?.returnTo === '/doctor-dashboard'
      ? '/doctor-dashboard'
      : '/doctor-appointments'

  useEffect(() => {
    if (!location.state?.appointment && dToken) getAppointments()
  }, [dToken, getAppointments, location.state?.appointment])

  const handleChange = (event) => {
    const { name, value } = event.target
    setPrescription((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const completed = await completeAppointment(id, prescription)
      if (completed) navigate(returnTo, { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

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
              {appointmentsLoading ? 'Loading appointment…' : 'Appointment not found'}
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
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          <span aria-hidden="true">←</span> Back to appointments
        </button>

        <header className="mb-6">
          <p className="workspace-eyebrow">PATIENT VISIT / CLINICAL RECORD</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Complete appointment
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Review the visit and record the assessment, observations, and care plan.
          </p>
        </header>

        <section className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
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
            <p className="text-xs font-medium text-slate-500">Scheduled visit</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {appointment.slotDate && slotDateFormat
                ? slotDateFormat(appointment.slotDate)
                : appointment.slotDate || 'Date unavailable'}
              {appointment.slotTime ? ` · ${appointment.slotTime}` : ''}
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PrescriptionSection
            number="01"
            title="Visit assessment"
            description="Document the reason for the visit and your clinical findings."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <PrescriptionField
                name="diagnosis"
                label="Diagnosis"
                value={prescription.diagnosis}
                onChange={handleChange}
                placeholder="Primary diagnosis"
              />
              <PrescriptionField
                name="symptoms"
                label="Symptoms"
                value={prescription.symptoms}
                onChange={handleChange}
                placeholder="Reported symptoms"
              />
              <div className="sm:col-span-2">
                <PrescriptionField
                  name="clinicalNotes"
                  label="Clinical notes"
                  multiline
                  rows={4}
                  value={prescription.clinicalNotes}
                  onChange={handleChange}
                  placeholder="Relevant examination findings and observations"
                />
              </div>
            </div>
          </PrescriptionSection>

          <PrescriptionSection
            number="02"
            title="Vitals"
            description="Add the observations recorded during the appointment."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <PrescriptionField
                name="bloodPressure"
                label="Blood pressure"
                value={prescription.bloodPressure}
                onChange={handleChange}
                placeholder="e.g. 120/80 mmHg"
              />
              <PrescriptionField
                name="temperature"
                label="Temperature"
                value={prescription.temperature}
                onChange={handleChange}
                placeholder="e.g. 37 °C"
              />
            </div>
          </PrescriptionSection>

          <PrescriptionSection
            number="03"
            title="Treatment plan"
            description="Specify medication, dosage, and any follow-up advice."
          >
            <div className="space-y-5">
              <PrescriptionField
                name="medicine"
                label="Medication and dosage"
                multiline
                rows={4}
                value={prescription.medicine}
                onChange={handleChange}
                placeholder="Medicine, dosage, and frequency"
              />
              <PrescriptionField
                name="advice"
                label="Patient advice"
                multiline
                rows={3}
                value={prescription.advice}
                onChange={handleChange}
                placeholder="Follow-up instructions and care advice"
              />
            </div>
          </PrescriptionSection>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Saving prescription…' : 'Save and complete appointment'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default CompleteAppointment
