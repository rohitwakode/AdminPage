import { useState } from 'react'
import PropTypes from 'prop-types'

const initialPrescription = {
  diagnosis: '',
  symptoms: '',
  clinicalNotes: '',
  bloodPressure: '',
  temperature: '',
  medicine: '',
  advice: ''
}

const fieldClassName =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'

const PrescriptionField = ({ name, label, multiline = false, rows = 3, ...props }) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    {multiline ? (
      <textarea
        name={name}
        rows={rows}
        className={`${fieldClassName} resize-y`}
        {...props}
      />
    ) : (
      <input name={name} className={fieldClassName} {...props} />
    )}
  </label>
)

PrescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  multiline: PropTypes.bool,
  rows: PropTypes.number
}

const FormSection = ({ eyebrow, title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-base font-semibold text-slate-900">{title}</h3>
    </div>
    {children}
  </section>
)

FormSection.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

const CompleteAppointmentModal = ({ appointment, onClose, onSubmit }) => {
  const [prescription, setPrescription] = useState(initialPrescription)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!appointment) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setPrescription((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const completed = await onSubmit(appointment.id ?? appointment._id, prescription)
      if (completed) onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="prescription-title"
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
              <h2 id="prescription-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Complete appointment
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add the visit details for {appointment.patient?.name || 'your patient'}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close prescription form"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-89px)] flex-col">
          <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <FormSection eyebrow="01 / Assessment" title="Visit notes">
              <div className="grid gap-4 sm:grid-cols-2">
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
                    rows={3}
                    value={prescription.clinicalNotes}
                    onChange={handleChange}
                    placeholder="Relevant examination findings and observations"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection eyebrow="02 / Observations" title="Vitals">
              <div className="grid gap-4 sm:grid-cols-2">
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
            </FormSection>

            <FormSection eyebrow="03 / Plan" title="Treatment">
              <div className="space-y-4">
                <PrescriptionField
                  name="medicine"
                  label="Medication and dosage"
                  multiline
                  rows={3}
                  value={prescription.medicine}
                  onChange={handleChange}
                  placeholder="Medicine, dosage, and frequency"
                />
                <PrescriptionField
                  name="advice"
                  label="Patient advice"
                  multiline
                  rows={2}
                  value={prescription.advice}
                  onChange={handleChange}
                  placeholder="Follow-up instructions and care advice"
                />
              </div>
            </FormSection>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save and complete'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

CompleteAppointmentModal.propTypes = {
  appointment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    patient: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default CompleteAppointmentModal
