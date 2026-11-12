import { useContext } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')

    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }

    if (aToken) {
      setAToken('')
      localStorage.removeItem('aToken')
    }
  }

  return (
    <div className="app-header flex items-center justify-between text-sm">
      <a href="/" className="app-brand">
        <span className="brand-red">ASCL</span><span className="brand-white">EPIUS</span>
      </a>
      <div className="flex items-center">
        <button
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Navbar
