import { useContext, useState, useEffect } from 'react';
import { toast } from '../../utils/notification';
import { AdminContext } from '../../context/AdminContext';

const AddDoctor = () => {
    const { aToken, addDoctor } = useContext(AdminContext);

    const [docImg, setDocImg] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('FEMALE');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [experience, setExperience] = useState('1 Year');
    const [fees, setFees] = useState('');
    const [about, setAbout] = useState('');
    const [speciality, setSpeciality] = useState('General physician');
    const [degree, setDegree] = useState('');

    const [address1, setAddress1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [country, setCountry] = useState('India');

    const [loading, setLoading] = useState(false);

    const specialityOptions = [
        'General physician',
        'Gynecologist',
        'Dermatologist',
        'Pediatricians',
        'Neurologist',
        'Gastroenterologist',
        'Cardiologist'
    ];

    const experienceOptions = [
        '1 Year', '2 Years', '3 Years', '4 Years',
        '5 Years', '6 Years', '7 Years', '8 Years',
        '9 Years', '10 Years'
    ];

    // Image preview cleanup
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Select doctor image
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPG, PNG and WEBP images are allowed.');
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB.');
            event.target.value = '';
            return;
        }

        setDocImg(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Reset form
    const resetForm = () => {
        setDocImg(null);
        setImagePreview('');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setGender('FEMALE');
        setDateOfBirth('');
        setExperience('1 Year');
        setFees('');
        setAbout('');
        setSpeciality('General physician');
        setDegree('');
        setAddress1('');
        setCity('');
        setState('');
        setPincode('');
        setCountry('India');

        const input = document.getElementById('doctor-image');
        if (input) input.value = '';
    };

    // Submit doctor form
    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!aToken) {
            toast.error('Admin token not found. Please login again.');
            return;
        }

        if (!docImg) {
            toast.error('Please select a doctor image.');
            return;
        }

        try {
            setLoading(true);

            const doctorData = {
                user: {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    gender,
                    dateOfBirth: `${dateOfBirth}T00:00:00`,
                    password
                },
                addReq: {
                    address: address1.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    pincode: pincode.trim(),
                    country: country.trim(),
                    latitude: null,
                    longitude: null
                },
                speciality,
                degree: degree.trim(),
                experience,
                about: about.trim(),
                available: true,
                fees: Number(fees)
            };

            const result = await addDoctor(doctorData, docImg);
            if (!result) return;

            resetForm();

        } catch (error) {
            console.error('Add Doctor Error:', error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to add doctor'
            );
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "px-4 py-3 rounded-xl border border-zinc-200 bg-white placeholder:text-zinc-400 text-zinc-900 focus:outline-none focus:border-violet-500 transition-colors text-sm w-full";
    const labelStyle = "text-zinc-700 font-medium text-xs tracking-wider uppercase mb-1.5 block";

    return (
        <>
            <div className="w-full min-h-screen bg-zinc-100 py-12 px-4 flex flex-col items-center justify-center">
                <form onSubmit={onSubmitHandler} className="w-full max-w-[1100px] flex flex-col md:flex-row gap-6 sm:gap-10">
                    
                    {/* Left Banner Card */}
                    <div className="w-full md:w-[42%] bg-violet-600 rounded-[24px] p-6 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-lg">
                        <div className="relative z-10 flex flex-col h-full">
                            <h1 className="text-3xl sm:text-[38px] font-semibold text-white tracking-tight leading-tight">
                                Build your care team
                            </h1>
                            <p className="text-sm text-violet-100 mt-4 leading-relaxed">
                                Add a practitioner profile to your care network and keep your team information in one place.
                            </p>
                            
                            <div className="flex flex-col gap-4 mt-8 sm:mt-12">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 bg-violet-500 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-[9px] text-white">INFO</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">Staff management</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-9 bg-violet-500 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-white">ADMIN</span>
                                    </div>
                                    <span className="text-white text-sm font-medium">Admin access required</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 font-bold text-[130px] text-violet-500/40 leading-none select-none pointer-events-none">
                            doctor
                        </div>
                    </div>

                    {/* Right Form Card */}
                    <div className="w-full md:w-[58%] bg-white border border-zinc-200 rounded-[24px] p-6 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <h2 className="text-2xl md:text-[28px] font-semibold text-zinc-800 mb-6 pb-4 border-b border-zinc-100">
                            Doctor Details
                        </h2>

                        {/* Image Uploader */}
                        <div className="flex items-center gap-5 mb-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Profile preview"
                                    className="w-20 h-20 rounded-2xl border border-zinc-300 object-contain shadow-sm"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl border border-zinc-300 flex items-center justify-center text-center text-[10px] text-zinc-500">
                                    No photo
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-zinc-700 block mb-1">Profile Photo</label>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="doctor-image" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg cursor-pointer transition">
                                        Choose File
                                    </label>
                                    <input
                                        id="doctor-image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    {docImg && (
                                        <button type="button" onClick={() => { setDocImg(null); setImagePreview(''); }} className="text-rose-500 text-xs font-medium hover:underline">
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {docImg && <p className="text-emerald-600 text-[11px] mt-1 font-medium truncate">{docImg.name}</p>}
                            </div>
                        </div>

                        {/* Form Inputs Grid */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. John Doe" className={inputStyle} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@email.com" className={inputStyle} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputStyle} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Phone Number</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputStyle} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelStyle}>Gender</label>
                                    <select value={gender} onChange={e => setGender(e.target.value)} className={inputStyle}>
                                        <option value="FEMALE">Female</option>
                                        <option value="MALE">Male</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Date of Birth</label>
                                    <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputStyle} required />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className={labelStyle}>Experience</label>
                                    <select value={experience} onChange={e => setExperience(e.target.value)} className={inputStyle}>
                                        {experienceOptions.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Speciality</label>
                                    <select value={speciality} onChange={e => setSpeciality(e.target.value)} className={inputStyle}>
                                        {specialityOptions.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Medical Degree</label>
                                    <input type="text" value={degree} onChange={e => setDegree(e.target.value)} placeholder="MBBS, MD" className={inputStyle} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Consultation Fees (₹)</label>
                                    <input type="number" min="0" value={fees} onChange={e => setFees(e.target.value)} placeholder="500" className={inputStyle} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Street Address</label>
                                    <input type="text" value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Clinic / Hospital Street" className={inputStyle} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className={labelStyle}>City</label>
                                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={inputStyle} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>State</label>
                                    <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className={inputStyle} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Pincode</label>
                                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Pincode" className={inputStyle} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Country</label>
                                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className={inputStyle} required />
                                </div>
                            </div>

                            <div>
                                <label className={labelStyle}>About Doctor</label>
                                <textarea value={about} onChange={e => setAbout(e.target.value)} rows="3" placeholder="Write a brief professional summary..." className="px-4 py-3 rounded-xl border border-zinc-200 bg-white placeholder:text-zinc-400 text-zinc-900 focus:outline-none focus:border-violet-500 transition-colors text-sm w-full resize-none"></textarea>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm py-4 rounded-full transition-colors cursor-pointer shadow-lg shadow-violet-600/20 disabled:opacity-50"
                            >
                                {loading ? 'Processing Doctor Profile...' : 'Confirm & Add Doctor'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
};

export default AddDoctor;