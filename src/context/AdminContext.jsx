
import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "../utils/notification";
import createDoctorFormData from "../utils/createDoctorFormData";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [aToken, setATokenState] = useState(
        localStorage.getItem("aToken") || ""
    );

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [dashData, setDashData] = useState(null);

    const setAToken = (token) => {
        if (token) {
            localStorage.setItem("aToken", token);
            setATokenState(token);
        } else {
            localStorage.removeItem("aToken");
            setATokenState("");
        }
    };

    const getAuthConfig = () => {
        const token = aToken || localStorage.getItem("aToken");

        if (!token) {
            throw new Error("Admin token missing. Please login again.");
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        };
    };

    const handleApiError = (error, operation) => {
        console.error(`${operation} Error:`, error);
        console.error("HTTP Status:", error.response?.status);
        console.error("Backend Response:", error.response?.data);

        if (error.response?.status === 401) {
            toast.error("Admin session expired. Please login again.");

            setAToken("");
            setDoctors([]);
            setAppointments([]);
            setPatients([]);
            setDashData(null);
        } else if (error.response?.status === 403) {
            toast.error("Admin access forbidden. Check JWT and ADMIN role.");
        } else {
            toast.error(
                error.response?.data?.message ||
                (typeof error.response?.data === "string"
                    ? error.response.data
                    : null) ||
                error.message ||
                "Something went wrong"
            );
        }
    };

    // GET ALL DOCTORS
    const getAllDoctors = async () => {
        if (!aToken && !localStorage.getItem("aToken")) return false;

        try {
            const { data } = await axios.get(
                `${backendUrl}/admin/doctors`,
                getAuthConfig()
            );

            if (Array.isArray(data)) {
                setDoctors(data);
                return true;
            }

            console.error("Unexpected doctors response:", data);
            toast.error("Invalid doctors response");
            return false;

        } catch (error) {
            handleApiError(error, "Get Doctors");
            return false;
        }
    };

    // ADD DOCTOR
    const addDoctor = async (doctorData, imageFile) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/admin/doctor`,
                createDoctorFormData(doctorData, imageFile),
                getAuthConfig()
            );

            toast.success("Doctor added successfully!");

            await getAllDoctors();

            return data;

        } catch (error) {
            if (error.response) {
                handleApiError(error, "Add Doctor");
            } else {
                console.error("Add Doctor Error:", error);
                toast.error(error.message || "Unable to add doctor.");
            }

            return false;
        }
    };

    // CHANGE AVAILABILITY
    const changeAvailability = async () => {
        toast.info("Availability API is not implemented in Spring Boot yet.");
        return false;
    };

    // DELETE DOCTOR
    const deleteDoctor = async (docId) => {
        try {
            if (docId === null || docId === undefined || docId === "") {
                toast.error("Doctor ID is missing.");
                return false;
            }

            const { data } = await axios.delete(
                `${backendUrl}/admin/delete/${encodeURIComponent(docId)}`,
                getAuthConfig()
            );

            toast.success(
                typeof data === "string"
                    ? data
                    : data?.message || "Doctor deleted successfully"
            );

            await getAllDoctors();
            return true;

        } catch (error) {
            handleApiError(error, "Delete Doctor");
            return false;
        }
    };

    // GET PATIENTS
    const getAllPatients = async () => {
        if (!aToken && !localStorage.getItem("aToken")) return false;

        try {
            const { data } = await axios.get(
                `${backendUrl}/admin/patient`,
                getAuthConfig()
            );

            setPatients(Array.isArray(data) ? data : []);
            return true;

        } catch (error) {
            handleApiError(error, "Get Patients");
            return false;
        }
    };

    // DELETE PATIENT
    const deletePatient = async (patientId) => {
        if (patientId === null || patientId === undefined || patientId === "") {
            toast.error("Patient ID is missing.");
            return false;
        }

        try {
            await axios.delete(
                `${backendUrl}/admin/patient/${encodeURIComponent(patientId)}`,
                getAuthConfig()
            );

            toast.success("Patient deleted successfully");
            await getAllPatients();
            return true;
        } catch (error) {
            handleApiError(error, "Delete Patient");
            return false;
        }
    };

    // GET APPOINTMENTS
    const getAllAppointments = async () => {
        if (!aToken) return false;

        try {
            const { data } = await axios.get(
                `${backendUrl}/admin/appointment`,
                getAuthConfig()
            );

            if (Array.isArray(data)) {
                setAppointments([...data].reverse());
                return true;
            }

            toast.error("Invalid appointments response");
            return false;

        } catch (error) {
            handleApiError(error, "Get Appointments");
            return false;
        }
    };

    // DELETE APPOINTMENT
    const cancelAppointment = async (appointmentId) => {
        try {
            if (!appointmentId) {
                toast.error("Appointment ID is missing.");
                return false;
            }

            const { data } = await axios.delete(
                `${backendUrl}/admin/${appointmentId}`,
                getAuthConfig()
            );

            toast.success(
                typeof data === "string"
                    ? data
                    : data?.message || "Appointment deleted successfully"
            );

            await getAllAppointments();
            return true;

        } catch (error) {
            handleApiError(error, "Delete Appointment");
            return false;
        }
    };

    // DASHBOARD DATA
   
const getDashData = async () => {
    if (!aToken && !localStorage.getItem("aToken")) {
        return false;
    }

    try {
        const config = getAuthConfig();

        // Fetch all dashboard data directly from Spring Boot
        const [doctorsRes, appointmentsRes, patientsRes] =
            await Promise.all([
                axios.get(`${backendUrl}/admin/doctors`, config),
                axios.get(`${backendUrl}/admin/appointment`, config),
                axios.get(`${backendUrl}/admin/patient`, config)
            ]);

        const doctorsData = Array.isArray(doctorsRes.data)
            ? doctorsRes.data : [];

        const appointmentsData = Array.isArray(appointmentsRes.data)
            ? appointmentsRes.data : [];

        const patientsData = Array.isArray(patientsRes.data)
            ? patientsRes.data : [];

        // Update context states
        setDoctors(doctorsData);
        setAppointments(appointmentsData);
        setPatients(patientsData);

        // Sort appointments by latest creation date
        const sortedAppointments = [...appointmentsData].sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

        // Calculate dashboard statistics
        const dashboardData = {
            doctors: doctorsData.length,

            appointments: appointmentsData.length,

            patients: patientsData.length,

            completedAppointments: appointmentsData.filter(
                item => item.isCompleted === true
            ).length,

            cancelledAppointments: appointmentsData.filter(
                item => item.cancelled === true
            ).length,

            pendingAppointments: appointmentsData.filter(
                item =>
                    item.cancelled !== true &&
                    item.isCompleted !== true
            ).length,

            latestAppointments: sortedAppointments.slice(0, 5)
        };

        setDashData(dashboardData);

        console.log("Dashboard Data:", dashboardData);

        return true;

    } catch (error) {
        handleApiError(error, "Get Dashboard Data");
        return false;
    }
};

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("aToken");

        setATokenState("");
        setDoctors([]);
        setAppointments([]);
        setPatients([]);
        setDashData(null);

        toast.success("Admin logged out successfully");
    };

    const value = {
        aToken,
        setAToken,
        logout,
        backendUrl,

        doctors,
        getAllDoctors,
        addDoctor,
        changeAvailability,
        deleteDoctor,

        patients,
        getAllPatients,
        deletePatient,

        appointments,
        getAllAppointments,
        cancelAppointment,

        dashData,
        getDashData
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
