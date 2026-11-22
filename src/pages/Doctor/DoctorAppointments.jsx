
import { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorAppointments = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment
  } = useContext(DoctorContext)

  const {
    slotDateFormat,
    calculateAge,
    currency
  } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken, getAppointments])

  // Safe patient data
  const getPatient = (item) => {
    return item.patient || item.userData || {}
  }

  // Get patient name
  const getPatientName = (item) => {
    const patient = getPatient(item)

    return patient.name || 'Unknown Patient'
  }

  // Get patient image
  const getPatientImage = (item) => {
    const patient = getPatient(item)

    return patient.image || ''
  }

  // Get patient age
  const getPatientAge = (item) => {
    const patient = getPatient(item)

    const dob =
      patient.dateOfBirth ||
      patient.dob ||
      patient.date_of_birth

    if (!dob || !calculateAge) {
      return 'N/A'
    }

    try {
      return calculateAge(dob)
    } catch (error) {
      console.error('Age calculation error:', error)
      return 'N/A'
    }
  }

  // Format appointment date
  const getAppointmentDate = (date) => {

    if (!date) return 'Date unavailable'

    try {
      return slotDateFormat
        ? slotDateFormat(date)
        : date
    } catch (error) {
      return date
    }
  }

  // Get appointment ID
  const getAppointmentId = (item) => {
    return item.id ?? item._id
  }

  // Get appointment fees
  const getAppointmentFees = (item) => {
    return item.amount ?? item.fees ?? item.docData?.fees ?? 0
  }

  return (

    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900 p-6">

      <div className="w-full rounded-2xl bg-black/70 backdrop-blur-xl border border-gray-800 shadow-[0_0_80px_rgba(139,92,246,0.25)] p-6 overflow-hidden">

        {/* Header */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-white mb-2">
            All Appointments
          </h1>

          <p className="text-gray-400">
            Manage and track all your patient appointments
          </p>

          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-purple-600/20 text-purple-300 text-sm">
            Total: {appointments?.length || 0} appointments
          </div>

        </div>

        {/* Table */}

        <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-[0_0_40px_rgba(59,130,246,0.25)]">

          {/* Table Header */}

          <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_1fr_1fr_2.5fr_1fr_1.5fr] bg-black/80 text-gray-300 font-semibold px-6 py-4">

            <p className="text-center">#</p>
            <p>Patient</p>
            <p className="text-center">Payment</p>
            <p className="text-center">Age</p>
            <p>Date & Time</p>
            <p className="text-center">Fees</p>
            <p className="text-center">Actions</p>

          </div>

          {/* Appointment Rows */}

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-800">

            {appointments?.map((item, index) => {

              const appointmentId = getAppointmentId(item)

              const isCancelled = Boolean(item.cancelled)
              const isCompleted = Boolean(item.isCompleted)

              return (

                <div
                  key={appointmentId ?? index}
                  className="grid grid-cols-1 sm:grid-cols-[0.5fr_2.5fr_1fr_1fr_2.5fr_1fr_1.5fr] items-center gap-3 px-6 py-4 text-gray-300 hover:bg-white/5 transition"
                >

                  {/* Index */}

                  <p className="text-center hidden sm:block">
                    {index + 1}
                  </p>

                  {/* Patient */}

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600 bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">
                      {getPatientImage(item) ? (
                        <img
                          src={getPatientImage(item)}
                          alt="Patient"
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : 'Patient'}
                    </div>

                    <div>
                      <p className="font-medium text-white">
                        {getPatientName(item)}
                      </p>

                      <p className="text-xs text-gray-500">
                        Appointment #{appointmentId ?? index + 1}
                      </p>
                    </div>

                  </div>

                  {/* Payment */}

                  <div className="text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.payment
                          ? 'bg-blue-600/20 text-blue-300'
                          : 'bg-orange-600/20 text-orange-300'
                      }`}
                    >
                      {item.payment ? 'Online' : 'Cash'}
                    </span>

                  </div>

                  {/* Age */}

                  <p className="text-center">
                    {getPatientAge(item)}
                  </p>

                  {/* Date and Time */}

                  <div>

                    <p className="text-white">
                      {getAppointmentDate(item.slotDate)}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {item.slotTime || 'Time unavailable'}
                    </p>

                  </div>

                  {/* Fees */}

                  <p className="text-center text-green-400 font-bold">
                    {currency}{getAppointmentFees(item)}
                  </p>

                  {/* Actions */}

                  <div className="flex justify-center gap-2">

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor-prescription/${appointmentId}`, {
                          state: { appointment: item, returnTo: location.pathname }
                        })}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40"
                      >
                        Prescription
                      </button>
                    )}

                    {isCancelled ? (

                      <span className="px-3 py-1 rounded-full text-xs bg-red-600/20 text-red-400">
                        Cancelled
                      </span>

                    ) : isCompleted ? (

                      <span className="px-3 py-1 rounded-full text-xs bg-green-600/20 text-green-400">
                        Completed
                      </span>

                    ) : (

                      <>

                        <button
                          onClick={() => {
                            if (appointmentId) {
                              cancelAppointment(appointmentId)
                            }
                          }}
                          disabled={!appointmentId}
                          className="px-3 py-1.5 rounded text-xs font-semibold bg-red-600/20 hover:bg-red-600/40 disabled:opacity-40"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => {
                            if (appointmentId) {
                              navigate(`/doctor-appointments/${appointmentId}/prescription`, {
                                state: { appointment: item, returnTo: location.pathname }
                              })
                            }
                          }}
                          disabled={!appointmentId}
                          className="px-3 py-1.5 rounded text-xs font-semibold bg-green-600/20 hover:bg-green-600/40 disabled:opacity-40"
                        >
                          Complete
                        </button>

                      </>

                    )}

                  </div>

                </div>

              )

            })}

            {/* Empty State */}

            {(!appointments || appointments.length === 0) && (

              <div className="py-20 text-center text-gray-500">

                <p className="text-6xl mb-4">
                </p>

                <p className="text-lg">
                  No appointments scheduled
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  )

}

export default DoctorAppointments
