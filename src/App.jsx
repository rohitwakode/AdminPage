import { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import ViewDoctor from './pages/Admin/ViewDoctor';
import PatientsList from './pages/Admin/PatientsList';

const App = () => {
  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  if (!dToken && !aToken) {
    return (
      <>
        <ToastContainer />
        <Login />
      </>
    )
  }

  const isDoctor = Boolean(dToken)
  const isAdmin = Boolean(aToken) && !isDoctor
  const homePath = isDoctor ? '/doctor-dashboard' : '/admin-dashboard'

  return (
    <div className='app-shell'>
      <ToastContainer />
      <Navbar />
      <div className='app-layout'>
        <Sidebar />
        <main className='app-main'>
          <Routes>
            <Route path='/' element={<Navigate to={homePath} replace />} />
            <Route
              path='/admin-dashboard'
              element={isAdmin ? <Dashboard /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/all-appointments'
              element={isAdmin ? <AllAppointments /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/add-doctor'
              element={isAdmin ? <AddDoctor /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/doctor-list'
              element={isAdmin ? <DoctorsList /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/patient-list'
              element={isAdmin ? <PatientsList /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/doctor/:id'
              element={isAdmin ? <ViewDoctor /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/doctor-dashboard'
              element={isDoctor ? <DoctorDashboard /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/doctor-appointments'
              element={isDoctor ? <DoctorAppointments /> : <Navigate to={homePath} replace />}
            />
            <Route
              path='/doctor-profile'
              element={isDoctor ? <DoctorProfile /> : <Navigate to={homePath} replace />}
            />
            <Route path='*' element={<Navigate to={homePath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App