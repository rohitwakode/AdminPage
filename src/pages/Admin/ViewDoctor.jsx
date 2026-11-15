import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../../utils/notification';
import { AdminContext } from '../../context/AdminContext';

const ViewDoctor = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        aToken,
        doctors,
        getAllDoctors,
        deleteDoctor
    } = useContext(AdminContext);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const getDoctorId = (doc) => (
        doc?.Id ??
        doc?.id ??
        doc?._id ??
        doc?.docId ??
        doc?.doctorId ??
        null
    );

    useEffect(() => {
        const fetchDoctors = async () => {
            if (!aToken) {
                setLoading(false);
                return;
            }

            setLoading(true);
            await getAllDoctors();
            setLoading(false);
        };

        fetchDoctors();
    }, [aToken]);

    const doctor = doctors?.find(
        item => String(getDoctorId(item)) === String(id)
    );

    useEffect(() => {
        setImageFailed(false);
    }, [id]);

    const handleDelete = async () => {
        const docId = getDoctorId(doctor);

        if (docId === null || docId === undefined) {
            toast.error("Doctor ID not found");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this doctor?")) {
            return;
        }

        try {
            setDeleting(true);
            const success = await deleteDoctor(docId);

            if (success) {
                navigate('/doctor-list');
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-300 text-sm font-medium">Loading doctor profile...</p>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <h2 className="text-2xl text-white font-bold">
                    Doctor Not Found
                </h2>
                <p className="text-slate-400 text-sm max-w-sm">The doctor profile you are looking for might have been removed or does not exist.</p>
                <button
                    onClick={() => navigate('/doctor-list')}
                    className="mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                    Back to Doctor List
                </button>
            </div>
        );
    }

    const doctorName = doctor.name || doctor.docName || 'Doctor';
    const doctorImage = doctor.image || doctor.docImage;
    const address = doctor.addRes || doctor.addReq || doctor.address || {};
    const isAvailable = Boolean(doctor.available);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/doctor-list')}
                    className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition"
                >
                    <span>←</span> Back to all doctors
                </button>

                {/* Main Profile Header Card */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8 border-b border-slate-800">
                    
                    {/* Doctor Image Container */}
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-slate-950 flex items-center justify-center shrink-0 shadow-xl">
                        {doctorImage && !imageFailed ? (
                            <img
                                src={doctorImage}
                                alt={doctorName}
                                loading="eager"
                                onError={() => setImageFailed(true)}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <span className="text-xs text-slate-400">No photo</span>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {doctorName}
                            </h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium self-center md:self-auto shadow-sm ${
                                isAvailable 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                {isAvailable ? 'Available for Consultations' : 'Currently Offline'}
                            </span>
                        </div>

                        <p className="text-indigo-400 font-semibold text-sm sm:text-base">
                            {doctor.speciality || 'General Medicine'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                            <span className="px-3 py-1 bg-slate-800/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60">
                                Degree: {doctor.degree || 'N/A'}
                            </span>
                            <span className="px-3 py-1 bg-slate-800/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60">
                                Experience: {doctor.experience || 'N/A'}
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20">
                                Fee: ₹{doctor.fees ?? '0'}
                            </span>
                        </div>

                        <div className="pt-2 text-slate-400 text-xs sm:text-sm space-y-1">
                            <p>Email: {doctor.email || 'N/A'}</p>
                            <p>Phone: {doctor.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Grid Details Section (Address & About) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    {/* Address Card */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            Clinic Address
                        </h3>
                        <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                            <p className="font-medium text-white">{address.address || 'Street address not available'}</p>
                            <p className="text-slate-400">
                                {address.city || ''}{address.state ? `, ${address.state}` : ''}
                            </p>
                            <div className="pt-2 flex justify-between text-slate-400 border-t border-slate-800/80 mt-3">
                                <span>Pincode: <strong className="text-slate-200">{address.pincode || 'N/A'}</strong></span>
                                <span>Country: <strong className="text-slate-200">{address.country || 'India'}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* About Card */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                About Doctor
                            </h3>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-5">
                                {doctor.about || 'No background description or professional biography provided for this doctor.'}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Delete / Actions Footer */}
                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Registered Medical Practitioner Profile</span>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition text-xs sm:text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                        {deleting ? 'Deleting Doctor...' : 'Delete Doctor'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ViewDoctor;