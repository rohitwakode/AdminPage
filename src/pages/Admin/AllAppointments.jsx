import { useEffect, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {

    const {
        aToken,
        appointments,
        cancelAppointment,
        getAllAppointments
    } = useContext(AdminContext)

    const {
        slotDateFormat,
        calculateAge,
        currency
    } = useContext(AppContext)

    useEffect(() => {
        if (aToken) {
            getAllAppointments()
        }
    }, [aToken])

    // Format date safely
    const formatDate = (date) => {
        if (!date) return 'N/A'

        try {
            return slotDateFormat
                ? slotDateFormat(date)
                : new Date(date).toLocaleDateString()
        } catch {
            return date
        }
    }

    // Format time
    const formatTime = (time) => {
        if (!time) return 'N/A'
        return time.slice(0, 5)
    }

    // Calculate patient age
    const getPatientAge = (patient) => {
        if (!patient?.dateOfBirth) return 'N/A'

        try {
            return calculateAge
                ? calculateAge(patient.dateOfBirth)
                : 'N/A'
        } catch {
            return 'N/A'
        }
    }

    // Handle appointment cancellation
    const handleCancel = async (appointmentId) => {
        if (!appointmentId) return

        const confirmCancel = window.confirm(
            'Are you sure you want to cancel this appointment?'
        )

        if (!confirmCancel) return

        await cancelAppointment(appointmentId)
        await getAllAppointments()
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            All Appointments
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base mt-1">
                            Manage, monitor, and track all scheduled patient appointments.
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 text-xs font-semibold self-start sm:self-auto">
                        Total Appointments: <span className="text-white bg-indigo-600/50 px-2 py-0.5 rounded-lg ml-1">{appointments?.length || 0}</span>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">

                    <div className="max-h-[75vh] overflow-auto">

                        {/* Table Header */}
                        <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_0.8fr_2fr_2.5fr_1fr_1.5fr] gap-4 px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur-md z-20 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <p>#</p>
                            <p>Patient Details</p>
                            <p>Age</p>
                            <p>Date & Time</p>
                            <p>Assigned Doctor</p>
                            <p>Fees</p>
                            <p className="text-center">Status / Action</p>
                        </div>

                        {/* Appointment Rows */}
                        {appointments?.length > 0 ? (
                            <div className="divide-y divide-slate-800/80">
                                {appointments.map((item, index) => {
                                    const patient = item.patient || {}
                                    const doctor = item.docData || {}
                                    const appointmentFees = item.fees ?? doctor.fees ?? 0
                                    const isCancelled = Boolean(item.cancelled)
                                    const isCompleted = Boolean(item.isCompleted)

                                    return (
                                        <div
                                            key={item.id ?? index}
                                            className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2.5fr_0.8fr_2fr_2.5fr_1fr_1.5fr] gap-4 items-center px-6 py-4 hover:bg-slate-950/40 transition-colors"
                                        >

                                            {/* Index */}
                                            <p className="hidden sm:block text-indigo-400 font-semibold text-sm">
                                                {index + 1}
                                            </p>

                                            {/* Patient */}
                                            <div className="flex items-center gap-3.5 w-full">
                                                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                                    {patient.image ? (
                                                        <img
                                                            src={patient.image}
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null
                                                                e.currentTarget.style.display = 'none'
                                                                e.currentTarget.nextElementSibling.style.display = 'flex'
                                                            }}
                                                            className="w-full h-full object-contain"
                                                            alt="Patient"
                                                        />
                                                    ) : null}
                                                    <span
                                                        style={{ display: patient.image ? 'none' : 'flex' }}
                                                        className="w-full h-full items-center justify-center text-[10px] text-slate-400"
                                                    >
                                                        No photo
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-bold text-sm truncate">
                                                        {patient.name || 'Unknown Patient'}
                                                    </p>
                                                    <p className="text-slate-400 text-xs truncate mt-0.5">
                                                        {patient.email || 'No email provided'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Age */}
                                            <div className="w-full sm:w-auto text-xs sm:text-sm text-slate-300">
                                                <span className="sm:hidden text-slate-500 mr-2">Age:</span>
                                                <span className="font-medium">{getPatientAge(patient)}</span>
                                            </div>

                                            {/* Date & Time */}
                                            <div className="w-full sm:w-auto text-xs sm:text-sm text-slate-300">
                                                <p className="font-medium text-slate-200">
                                                    {formatDate(item.slotDate)}
                                                </p>
                                                <p className="text-indigo-400 font-semibold text-xs mt-0.5">
                                                    {formatTime(item.slotTime)}
                                                </p>
                                            </div>

                                            {/* Doctor */}
                                            <div className="flex items-center gap-3.5 w-full">
                                                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                                    {doctor.docImage ? (
                                                        <img
                                                            src={doctor.docImage}
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null
                                                                e.currentTarget.style.display = 'none'
                                                                e.currentTarget.nextElementSibling.style.display = 'flex'
                                                            }}
                                                            className="w-full h-full object-cover"
                                                            alt="Doctor"
                                                        />
                                                    ) : null}
                                                    <span
                                                        style={{ display: doctor.docImage ? 'none' : 'flex' }}
                                                        className="w-full h-full items-center justify-center text-[10px] text-slate-400"
                                                    >
                                                        No photo
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-bold text-sm truncate">
                                                        {doctor.docName || 'Unknown Doctor'}
                                                    </p>
                                                    <p className="text-slate-400 text-xs truncate mt-0.5">
                                                        {doctor.speciality || 'General Medicine'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Fees */}
                                            <div className="w-full sm:w-auto text-emerald-400 font-bold text-sm sm:text-base">
                                                {currency}{appointmentFees}
                                            </div>

                                            {/* Status / Action */}
                                            <div className="flex justify-start sm:justify-center w-full sm:w-auto">
                                                {isCancelled ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Cancelled
                                                    </span>
                                                ) : isCompleted ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Completed
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Pending
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancel(item.id)}
                                                            className="px-3 py-1.5 rounded text-xs font-semibold bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition shadow-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-20 px-4">
                                <p className="text-slate-300 font-semibold text-lg">No appointments found</p>
                                <p className="text-slate-500 text-sm mt-1">There are currently no scheduled appointments in the system.</p>
                            </div>
                        )}

                    </div>

                </div>

            </div>
        </div>
    )
}

export default AllAppointments