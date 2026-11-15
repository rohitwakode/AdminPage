
import { createContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "../utils/notification";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDTokenState] = useState(
        localStorage.getItem("dToken") || ""
    );

    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    // Save Doctor Token
    const setDToken = (token) => {

        if (token) {
            localStorage.setItem("dToken", token);
            setDTokenState(token);
        } else {
            localStorage.removeItem("dToken");
            setDTokenState("");
        }

    };

    // Authorization Configuration
    const getAuthConfig = () => {

        const token = dToken || localStorage.getItem("dToken");

        if (!token) {
            throw new Error("Doctor token missing. Please login again.");
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        };

    };

    // Common API Error Handler
    const handleApiError = (error, operation) => {

        console.error(`${operation} Error:`, error);

        const status = error.response?.status;

        console.log("HTTP Status:", status);
        console.log("Backend Response:", error.response?.data);

        if (status === 401) {

            toast.error("Doctor session expired. Please login again.");

            setDToken("");

            setAppointments([]);
            setProfileData(null);
            setDashData(null);

        } else if (status === 403) {

            toast.error(
                "Access forbidden. Check doctor JWT permissions and role."
            );

        } else {

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Something went wrong"
            );

        }

    };

    // Get Doctor Appointments
    const getAppointments = useCallback(async () => {

        try {

            if (!dToken) return [];

            setAppointmentsLoading(true);

            const { data } = await axios.get(
                `${backendUrl}/doctor/appointment`,
                getAuthConfig()
            );

            console.log("Doctor Appointments:", data);

            const appointmentList = Array.isArray(data) ? data : [];

            setAppointments(appointmentList);

            return appointmentList;

        } catch (error) {

            handleApiError(error, "Appointments");

            return [];

        } finally {

            setAppointmentsLoading(false);

        }

    }, [dToken, backendUrl]);

    // Get Doctor Profile
    const getProfileData = useCallback(async () => {

        try {

            if (!dToken) return;

            setProfileLoading(true);

            const { data } = await axios.get(
                `${backendUrl}/doctor/profile`,
                getAuthConfig()
            );

            console.log("Doctor Profile:", data);

            setProfileData(data);

        } catch (error) {

            handleApiError(error, "Doctor Profile");

        } finally {

            setProfileLoading(false);

        }

    }, [dToken, backendUrl]);

    // Calculate Dashboard Data From Backend Appointments
    const getDashData = useCallback(async () => {

        try {

            if (!dToken) return;

            setDashboardLoading(true);

            const { data } = await axios.get(
                `${backendUrl}/doctor/appointment`,
                getAuthConfig()
            );

            const appointmentList = Array.isArray(data) ? data : [];

            console.log("Dashboard Appointment Data:", appointmentList);

            // Update appointments
            setAppointments(appointmentList);

            // Total unique patients
            const uniquePatients = new Set(
                appointmentList
                    .map(item =>
                        item.patient?.Id ??
                        item.patient?.id ??
                        item.patient?.email
                    )
                    .filter(Boolean)
            );

            // Total earnings from completed appointments
            const earnings = appointmentList
                .filter(item =>
                    !item.cancelled && item.isCompleted
                )
                .reduce((total, item) => {

                    return total + Number(
                        item.fees ??
                        item.docData?.fees ??
                        0
                    );

                }, 0);

            // Completed appointments
            const completed = appointmentList.filter(
                item => item.isCompleted && !item.cancelled
            ).length;

            // Cancelled appointments
            const cancelled = appointmentList.filter(
                item => item.cancelled
            ).length;

            // Pending appointments
            const pending = appointmentList.filter(
                item => !item.cancelled && !item.isCompleted
            ).length;

            // Latest appointments
            const latestAppointments = [...appointmentList].sort(
                (a, b) => {

                    const dateA = new Date(
                        `${a.slotDate}T${a.slotTime || "00:00:00"}`
                    );

                    const dateB = new Date(
                        `${b.slotDate}T${b.slotTime || "00:00:00"}`
                    );

                    return dateB - dateA;

                }
            );

            // Dashboard Object
            const dashboardData = {

                earnings,

                appointments: appointmentList.length,

                patients: uniquePatients.size,

                completed,

                cancelled,

                pending,

                latestAppointments

            };

            console.log("Generated Doctor Dashboard:", dashboardData);

            setDashData(dashboardData);

        } catch (error) {

            handleApiError(error, "Doctor Dashboard");

        } finally {

            setDashboardLoading(false);

        }

    }, [dToken, backendUrl]);

    // Refresh Doctor Data
    const refreshDoctorData = useCallback(async () => {

        await Promise.all([
            getDashData(),
            getProfileData()
        ]);

    }, [getDashData, getProfileData]);

    // Cancel Appointment
    const cancelAppointment = async (appointmentId) => {

        try {

            if (!appointmentId) {
                toast.error("Appointment ID is missing");
                return;
            }

            if (!dToken) {
                toast.error("Please login again.");
                return;
            }

            // Update this URL if your backend uses a different mapping.
            const { data } = await axios.put(
                `${backendUrl}/doctor/cancel/${appointmentId}`,
                {},
                getAuthConfig()
            );

            console.log("Appointment Cancelled:", data);

            toast.success("Appointment cancelled successfully");

            await getDashData();

        } catch (error) {

            handleApiError(error, "Cancel Appointment");

        }

    };

    // Complete Appointment
    const completeAppointment = async (appointmentId, prescription) => {

        try {

            if (!appointmentId) {
                toast.error("Appointment ID is missing");
                return false;
            }

            if (!dToken) {
                toast.error("Please login as doctor again.");
                return false;
            }

            const { data } = await axios.put(
                `${backendUrl}/doctor/complete/${appointmentId}`,
                prescription,
                getAuthConfig()
            );

            console.log("Appointment Completed:", data);

            toast.success("Appointment completed successfully");

            await getDashData();
            return true;

        } catch (error) {

            handleApiError(error, "Complete Appointment");
            return false;

        }

    };

    // Doctor Logout
    const logoutDoctor = () => {

        localStorage.removeItem("dToken");

        setDTokenState("");

        setAppointments([]);
        setProfileData(null);
        setDashData(null);

        toast.success("Doctor logged out successfully");

    };

    const value = {

        dToken,
        setDToken,
        logoutDoctor,

        backendUrl,

        appointments,
        setAppointments,
        appointmentsLoading,
        getAppointments,

        cancelAppointment,
        completeAppointment,

        dashData,
        getDashData,
        dashboardLoading,

        profileData,
        setProfileData,
        profileLoading,
        getProfileData,

        refreshDoctorData

    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );

};

export default DoctorContextProvider;
