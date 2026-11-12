import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const getPatientId = (patient) =>
    patient?.id ?? patient?.Id ?? patient?.patientId

const PatientsList = () => {
    const { aToken, patients, getAllPatients, deletePatient } = useContext(AdminContext)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        if (aToken) getAllPatients()
        // The context recreates this action on each render; the token controls this fetch.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aToken])

    const handleDelete = async (patient) => {
        const patientId = getPatientId(patient)
        if (patientId === null || patientId === undefined) return

        const patientName = patient.name || 'this patient'
        if (!window.confirm(`Are you sure you want to delete ${patientName}?`)) return

        setDeletingId(patientId)
        try {
            await deletePatient(patientId)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
                <div className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">
                            Registered Patients
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            View and manage patient accounts.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400 sm:self-auto">
                        <span>Total Patients:</span>
                        <span className="rounded-lg bg-indigo-600/50 px-2 py-0.5 text-white">
                            {patients?.length || 0}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full min-w-[700px] text-left text-sm text-slate-300">
                        <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-5 py-4">Patient</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Phone</th>
                                <th className="px-5 py-4">Gender</th>
                                <th className="px-5 py-4">Date of birth</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {patients?.map((patient, index) => {
                                const patientId = getPatientId(patient)
                                const image = patient.image
                                const key = patientId ?? index

                                return (
                                    <tr key={key} className="hover:bg-white/[0.03]">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400">
                                                        —
                                                    </div>
                                                )}
                                                <span className="font-medium text-white">
                                                    {patient.name || 'Unknown patient'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">{patient.email || '—'}</td>
                                        <td className="px-5 py-4">{patient.phone || '—'}</td>
                                        <td className="px-5 py-4">{patient.gender || '—'}</td>
                                        <td className="px-5 py-4">
                                            {patient.dateOfBirth
                                                ? new Date(patient.dateOfBirth).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                disabled={patientId == null || deletingId === patientId}
                                                onClick={() => handleDelete(patient)}
                                                className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {deletingId === patientId ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {(!patients || patients.length === 0) && (
                                <tr>
                                    <td colSpan="6" className="px-5 py-14 text-center text-slate-500">
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default PatientsList
