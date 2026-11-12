import { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {

    const {
        aToken,
        getDashData,
        cancelAppointment,
        dashData
    } = useContext(AdminContext)

    const { slotDateFormat, currency } = useContext(AppContext)

    useEffect(() => {
        if (aToken) {
            getDashData()
        }
    }, [aToken])

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            await cancelAppointment(id)
            await getDashData()
        }
    }

    if (!dashData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-300 text-sm font-medium">Loading dashboard overview...</p>
                </div>
            </div>
        )
    }

    const stats = [
        {
            label: 'Total Doctors',
            value: dashData.doctors,
            borderGlow: 'hover:border-blue-500/50',
            bgGlow: 'from-blue-600/20 to-indigo-600/5'
        },
        {
            label: 'Total Appointments',
            value: dashData.appointments,
            borderGlow: 'hover:border-emerald-500/50',
            bgGlow: 'from-emerald-600/20 to-teal-600/5'
        },
        {
            label: 'Total Patients',
            value: dashData.patients,
            borderGlow: 'hover:border-amber-500/50',
            bgGlow: 'from-amber-600/20 to-orange-600/5'
        },
        {
            label: 'Completed',
            value: dashData.completedAppointments,
            borderGlow: 'hover:border-emerald-500/50',
            bgGlow: 'from-emerald-600/20 to-teal-600/5'
        },
        {
            label: 'Cancelled',
            value: dashData.cancelledAppointments,
            borderGlow: 'hover:border-rose-500/50',
            bgGlow: 'from-rose-600/20 to-red-600/5'
        },
        {
            label: 'Pending',
            value: dashData.pendingAppointments,
            borderGlow: 'hover:border-purple-500/50',
            bgGlow: 'from-purple-600/20 to-indigo-600/5'
        }
    ]

    const latestAppointments = dashData.latestAppointments || []

    return (
        <div className="workspace-page admin-dashboard min-h-screen w-full py-10 px-4 sm:px-6 lg:px-8">

            <div className="max-w-7xl mx-auto">

                <header className="workspace-heading mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="workspace-eyebrow">ADMINISTRATION / OVERVIEW</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Dashboard overview
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base mt-2">
                            Monitor your medical practice performance, metrics, and latest bookings.
                        </p>
                    </div>
                    <div className="workspace-status self-start sm:self-auto">
                        <span className="workspace-status-dot" />
                        <span>System operational</span>
                    </div>
                </header>

                {/* Statistics Grid */}
                <section className="workspace-stats grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                    {stats.map((item, index) => (
                        <div
                            key={index}
                            className="workspace-stat-card"
                        >
                            <span className="workspace-stat-index">{String(index + 1).padStart(2, '0')}</span>
                            <div className="workspace-stat-content">
                                <p className="workspace-stat-value">
                                    {item.value ?? 0}
                                </p>
                                <p className="workspace-stat-label">
                                    {item.label}
                                </p>
                            </div>
                            <span className="workspace-stat-accent" />
                        </div>
                    ))}
                </section>

                {/* Latest Bookings Section */}
                <section className="workspace-panel bg-slate-900/70 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

                    <div className="workspace-panel-heading flex items-center justify-between px-6 sm:px-8 py-6 border-b border-slate-800">
                        <div>
                            <p className="workspace-eyebrow">RECENT ACTIVITY</p>
                            <h2 className="text-xl font-bold text-white">
                                Latest bookings
                            </h2>
                        </div>
                        <span className="workspace-count">
                            {latestAppointments.length} recent
                        </span>
                    </div>

                    {latestAppointments.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <p className="text-slate-300 font-semibold text-lg">No recent appointments</p>
                            <p className="text-slate-500 text-sm mt-1">New patient bookings will appear here instantly.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/80">
                            {latestAppointments.map((item) => {
                                const doctorName = item.docData?.docName || 'Unknown Doctor';
                                const doctorImage = item.docData?.docImage;
                                const isCancelled = Boolean(item.cancelled);
                                const isCompleted = Boolean(item.isCompleted);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-5 hover:bg-slate-950/40 transition"
                                    >
                                        {/* Doctor & Appointment Details */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                                {doctorImage ? (
                                                    <img
                                                        src={doctorImage}
                                                        className="w-full h-full object-contain"
                                                        alt={doctorName}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No photo</div>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-white font-bold text-base">
                                                    {doctorName}
                                                </p>
                                                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                                                    Scheduled for: <strong className="text-slate-200">{item.slotDate ? slotDateFormat(item.slotDate) : 'Date unavailable'}</strong> at <strong className="text-slate-200">{item.slotTime || 'N/A'}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Fees & Status / Actions */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                                            <div className="text-emerald-400 font-bold text-base">
                                                {currency}{item.fees ?? 0}
                                            </div>

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
                                                        onClick={() => handleCancel(item.id)}
                                                        className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition"
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
                    )}

                </section>

            </div>
        </div>
    )
}

export default Dashboard