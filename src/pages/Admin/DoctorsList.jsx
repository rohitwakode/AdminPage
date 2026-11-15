import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/notification';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    const {
        doctors,
        changeAvailability,
        deleteDoctor,
        aToken,
        getAllDoctors
    } = useContext(AdminContext);

    // Get doctor ID safely
    const getDoctorId = (item) => item?.docId;

    // Fetch doctors
    useEffect(() => {
        if (aToken) {
            getAllDoctors();
        }
    }, [aToken]);

    // View doctor profile
    const handleView = (item) => {
        const docId = getDoctorId(item);

        if (!docId) {
            toast.error('Doctor ID is missing');
            return;
        }

        navigate(`/doctor/${docId}`);
    };

    // Delete doctor
    const handleDelete = async (item) => {
        const docId = getDoctorId(item);

        if (!docId) {
            toast.error('Doctor ID is missing');
            return;
        }

        if (!window.confirm(
            `Are you sure you want to delete ${item.docName}?`
        )) {
            return;
        }

        try {
            setDeletingId(docId);
            const success = await deleteDoctor(docId);

            if (success) {
                setActiveDropdownId(null);
            }
        } finally {
            setDeletingId(null);
        }
    };

    // Change availability
    const handleAvailability = async (docId) => {
        await changeAvailability(docId);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">

            <div className="w-full max-w-7xl mx-auto rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            Registered Doctors
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Manage your clinic&apos;s medical staff, status, and credentials.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 text-sm font-semibold">
                        <span>Total Active Staff:</span>
                        <span className="text-white bg-indigo-600/50 px-2 py-0.5 rounded-lg">{doctors?.length || 0}</span>
                    </div>
                </div>

                {/* Doctors Grid */}
                {doctors?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                        {doctors.map((item, index) => {
                            const docId = getDoctorId(item);
                            const doctorName = item.docName || 'Unknown Doctor';
                            const doctorImage = item.docImage;
                            const isAvailable = Boolean(item.available);

                            return (
                                <div
                                    key={docId ?? index}
                                    className="relative group bg-slate-950/60 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
                                >
                                    {/* Top Image & Dropdown Container */}
                                    <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-900">
                                        {doctorImage ? (
                                            <img
                                                src={doctorImage}
                                                alt={doctorName}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                                }}
                                                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : null}

                                        {/* Fallback Icon */}
                                        <div
                                            style={{ display: doctorImage ? 'none' : 'flex' }}
                                            className="w-full h-full items-center justify-center bg-slate-900 text-slate-700"
                                        >
                                            <span className="text-sm text-slate-400">No photo</span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute bottom-3 left-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-md ${
                                                isAvailable 
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                                {isAvailable ? 'Available' : 'Offline'}
                                            </span>
                                        </div>

                                        {/* Options Dropdown Menu Button */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <button
                                                className="w-8 h-8 flex items-center justify-center text-white rounded-full bg-slate-950/70 hover:bg-slate-800 border border-slate-700/50 backdrop-blur-md transition shadow-md"
                                                onClick={() =>
                                                    setActiveDropdownId(
                                                        activeDropdownId === docId ? null : docId
                                                    )
                                                }
                                            >
                                                •••
                                            </button>

                                            {activeDropdownId === docId && (
                                                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-700 z-30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
                                                    <button
                                                        disabled={deletingId === docId}
                                                        onClick={() => handleDelete(item)}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-600 hover:text-white disabled:opacity-50 transition flex items-center gap-2"
                                                    >
                                                        {deletingId === docId ? 'Deleting...' : 'Delete Doctor'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Body */}
                                    <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                                        <div>
                                            <h3 className="text-white text-base font-bold truncate" title={doctorName}>
                                                {doctorName}
                                            </h3>
                                            <p className="text-indigo-400 text-xs font-medium mt-0.5 truncate">
                                                {item.speciality || 'General Medicine'}
                                            </p>

                                            <div className="mt-3 space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Degree:</span>
                                                    <span className="text-slate-200 truncate max-w-[120px]">{item.degree || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Experience:</span>
                                                    <span className="text-slate-200">{item.experience || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Consultation:</span>
                                                    <span className="text-emerald-400 font-semibold">₹{item.fees ?? '0'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                            {/* Toggle Switch */}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAvailable}
                                                    disabled={!docId}
                                                    onChange={() => handleAvailability(docId)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                <span className="ml-2 text-xs text-slate-300 font-medium select-none">Active</span>
                                            </label>

                                            {/* View Profile Button */}
                                            <button
                                                onClick={() => handleView(item)}
                                                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl transition-all text-xs font-semibold"
                                            >
                                                Profile
                                            </button>
                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <p className="text-slate-300 font-semibold text-lg">No doctors found</p>
                        <p className="text-slate-500 text-sm mt-1">Add a new doctor to view them in this list.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DoctorsList;
