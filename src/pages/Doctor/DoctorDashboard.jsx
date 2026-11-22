
import { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const {
        dToken,
        dashData,
        getDashData,
        cancelAppointment
    } = useContext(DoctorContext)

    const { slotDateFormat, currency } = useContext(AppContext)

    useEffect(() => {
        if (dToken) getDashData()
    }, [dToken, getDashData])

    if (!dashData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <p className="text-gray-300">Loading dashboard...</p>
            </div>
        )
    }

    const stats = [
        {
            label: 'Total Earnings',
            value: `${currency}${dashData.earnings}`,
            color: 'text-green-400'
        },
        {
            label: 'Appointments',
            value: dashData.appointments,
            color: 'text-blue-400'
        },
        {
            label: 'Total Patients',
            value: dashData.patients,
            color: 'text-purple-400'
        },
        {
            label: 'Completed',
            value: dashData.completed,
            color: 'text-green-400'
        },
        {
            label: 'Pending',
            value: dashData.pending,
            color: 'text-yellow-400'
        },
        {
            label: 'Cancelled',
            value: dashData.cancelled,
            color: 'text-red-400'
        }
    ]

    const latestAppointments = dashData.latestAppointments || []

    return (
        <div className="workspace-page doctor-dashboard min-h-screen w-full p-6">

            <div className="max-w-7xl mx-auto">

                <header className="workspace-heading mb-10">
                    <p className="workspace-eyebrow">CLINICAL PORTAL / OVERVIEW</p>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Your practice at a glance
                    </h1>
                    <p className="text-gray-400">
                        Track your appointments, patient activity, and earnings.
                    </p>
                </header>

                {/* Statistics */}

                <div className="workspace-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">

                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="workspace-stat-card"
                        >

                            <span className="workspace-stat-index">{String(index + 1).padStart(2, '0')}</span>
                            <div className="workspace-stat-content">
                                <p className="workspace-stat-value">{stat.value}</p>
                                <p className="workspace-stat-label">{stat.label}</p>
                            </div>
                            <span className="workspace-stat-accent" />
                        </div>
                    ))}

                </div>

                {/* Latest Appointments */}

                <div className="workspace-panel bg-black/70 border border-gray-800 rounded-2xl backdrop-blur-xl shadow-xl overflow-hidden">

                    <div className="workspace-panel-heading flex items-center justify-between px-6 py-5 border-b border-gray-800">
                        <div>
                            <p className="workspace-eyebrow">YOUR SCHEDULE</p>
                            <h2 className="text-xl font-semibold text-white">
                                Latest appointments
                            </h2>
                        </div>
                        <span className="workspace-count">
                            {latestAppointments.length} total
                        </span>

                    </div>

                    <div className="divide-y divide-gray-800">

                        {latestAppointments.slice(0, 5).map((item, index) => {

                            const patient = item.patient || {}

                            const appointmentId = item.id ?? item._id

                            return (

                                <div
                                    key={appointmentId ?? index}
                                    className="flex flex-wrap items-center gap-4 px-6 py-5 hover:bg-white/5 transition"
                                >

                                    <div className="flex-1 min-w-[150px]">

                                        <p className="text-white font-semibold">
                                            {patient.name || 'Unknown Patient'}
                                        </p>

                                        <p className="text-gray-400 text-sm">
                                            {slotDateFormat(item.slotDate)}, {item.slotTime}
                                        </p>

                                    </div>

                                    <p className="text-green-400 font-semibold">
                                        {currency}{item.fees ?? item.docData?.fees ?? 0}
                                    </p>

                                    <div className="flex gap-2">

                                        {item.isCompleted && (
                                            <button
                                                onClick={() => navigate(
                                                    `/doctor-prescription/${appointmentId}`,
                                                    {
                                                        state: {
                                                            appointment: item,
                                                            returnTo: location.pathname
                                                        }
                                                    }
                                                )}
                                                className="rounded-full bg-indigo-600/20 px-3 py-2 text-xs text-indigo-300 hover:bg-indigo-600/40"
                                                title="View prescription"
                                            >
                                                Prescription
                                            </button>
                                        )}

                                        {item.cancelled ? (

                                            <span className="px-3 py-1 rounded-full text-xs bg-red-600/20 text-red-400">
                                                Cancelled
                                            </span>

                                        ) : item.isCompleted ? (

                                            <span className="px-3 py-1 rounded-full text-xs bg-green-600/20 text-green-400">
                                                Completed
                                            </span>

                                        ) : (

                                            <>
                                                <button
                                                    onClick={() => cancelAppointment(appointmentId)}
                                                    className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40"
                                                    title="Cancel appointment"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    onClick={() => navigate(
                                                        `/doctor-appointments/${appointmentId}/prescription`,
                                                        {
                                                            state: {
                                                                appointment: item,
                                                                returnTo: location.pathname
                                                            }
                                                        }
                                                    )}
                                                    className="p-2 rounded-full bg-green-600/20 hover:bg-green-600/40"
                                                    title="Complete appointment"
                                                    disabled={!appointmentId}
                                                >
                                                    Complete
                                                </button>
                                            </>

                                        )}

                                    </div>

                                </div>

                            )
                        })}

                        {latestAppointments.length === 0 && (

                            <div className="py-16 text-center text-gray-500">
                                <p>No appointments available</p>
                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    )
}

export default DoctorDashboard
