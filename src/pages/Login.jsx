
import { useContext, useState } from 'react'
import axios from 'axios'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import doctorImage from '../assets/doctor_image.jpg'

const Login = () => {
  const [state, setState] = useState('Doctor')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [view, setView] = useState('login')
  const [loading, setLoading] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const getErrorMessage = (error, fallback) => {
    const responseMessage = error.response?.data
    return (
      (typeof responseMessage === 'string' && responseMessage) ||
      responseMessage?.message ||
      error.message ||
      fallback
    )
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)

      const { data } = await axios.post(
        `${backendUrl}/auth/login`,
        { email, password }
      )

      if (data.token) {
        if (state === 'Admin') {
          setDToken('')
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
          toast.success('Admin login successful')
        } else {
          setAToken('')
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
          toast.success('Doctor login successful')
        }
      } else {
        toast.error('Token not received from server')
      }

    } catch (error) {
      console.error(
        'Login error:',
        error.response?.data || error
      )

      toast.error(getErrorMessage(error, 'Login failed. Please try again.'))

    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      const { data } = await axios.post(
        `${backendUrl}/auth/send-otp`,
        null,
        { params: { email } }
      )
      toast.success(typeof data === 'string' ? data : 'OTP sent to your email')
      setView('otp')
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error)
      toast.error(getErrorMessage(error, 'Could not send OTP. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/auth/verify-otp`, {
        email,
        otp
      })
      const token = typeof data === 'string' ? data : data?.token

      if (!token) {
        toast.error('Reset token not received from server')
        return
      }

      setResetToken(token)
      setView('password')
      toast.success('Email verified. Choose a new password.')
    } catch (error) {
      console.error('OTP verification error:', error.response?.data || error)
      toast.error(getErrorMessage(error, 'OTP verification failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/auth/reset-password`, {
        email,
        token: resetToken,
        password
      })
      toast.success(typeof data === 'string' ? data : 'Password reset successfully')
      setPassword('')
      setConfirmPassword('')
      setOtp('')
      setResetToken('')
      setView('login')
    } catch (error) {
      console.error('Password reset error:', error.response?.data || error)
      toast.error(getErrorMessage(error, 'Could not reset password. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const returnToLogin = () => {
    setView('login')
    setOtp('')
    setResetToken('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-visual">
          <img
            src={doctorImage}
            alt=""
          />
          <div className="login-visual-brand"><span className="brand-red">ASCL</span><span className="brand-white">EPIUS</span> <small>CLINIC PORTAL</small></div>
          <div className="login-visual-copy">
            <p className="login-kicker">A BETTER WAY TO CARE</p>
            <h2>Healthcare,<br />in focus.</h2>
            <p>One calm, connected workspace for the people who keep care moving.</p>
            <div className="login-visual-meta">
              <span>01</span>
              <i />
              <span>CARE MANAGEMENT</span>
            </div>
          </div>
        </div>
        <form
          onSubmit={
            view === 'login'
              ? onSubmitHandler
              : view === 'email'
                ? sendOtp
                : view === 'otp'
                  ? verifyOtp
                  : resetPassword
          }
          className="login-form text-sm"
        >
          <div className="login-heading">
            <p className="login-kicker">
              {view === 'login' ? 'WELCOME BACK' : 'ACCOUNT RECOVERY'}
            </p>
            <h1>
              {view === 'login' ? (
                <>Sign in to <span className="brand-word"><span className="brand-red">ASCL</span><span className="brand-white">EPIUS</span></span></>
              ) : view === 'email' ? 'Forgot password?' : view === 'otp' ? 'Verify your email' : 'Create a new password'}
            </h1>
            <p>
              {view === 'login'
                ? 'Access your workspace with your account details.'
                : view === 'email'
                  ? 'Enter the email address linked to your account to receive an OTP.'
                  : view === 'otp'
                    ? `Enter the OTP sent to ${email}.`
                    : `Choose a new password for ${email}.`}
            </p>
          </div>
          {view === 'login' && (
            <>
              <div className="login-role-switch" role="group" aria-label="Choose account type">
                {['Admin', 'Doctor'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={state === role}
                    className={state === role ? 'selected' : ''}
                    onClick={() => setState(role)}
                  >
                    <span className="login-role-dot" />
                    <span>{role}</span>
                    <small>{role === 'Admin' ? 'Manage workspace' : 'Clinical portal'}</small>
                  </button>
                ))}
              </div>
              <div>
                <label className="font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" disabled={loading}>
                <span>{loading ? 'Signing in...' : `Continue as ${state}`}</span>
                {!loading && <span aria-hidden="true">→</span>}
              </button>
              <button
                type="button"
                className="login-forgot-link"
                onClick={() => {
                  setPassword('')
                  setView('email')
                }}
              >
                Forgot password?
              </button>
            </>
          )}
          {view === 'email' && (
            <>
              <div>
                <label className="font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading}>
                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                {!loading && <span aria-hidden="true">→</span>}
              </button>
              <button type="button" className="login-forgot-link" onClick={returnToLogin}>
                Back to sign in
              </button>
            </>
          )}
          {view === 'otp' && (
            <>
              <div>
                <label className="font-medium">OTP</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter verification code"
                  autoComplete="one-time-code"
                />
              </div>
              <button type="submit" disabled={loading}>
                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                {!loading && <span aria-hidden="true">→</span>}
              </button>
              <button type="button" className="login-forgot-link" onClick={() => setView('email')}>
                Change email or resend OTP
              </button>
            </>
          )}
          {view === 'password' && (
            <>
              <div>
                <label className="font-medium">New password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="font-medium">Confirm new password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={loading}>
                <span>{loading ? 'Resetting password...' : 'Reset password'}</span>
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </>
          )}
          <div className="login-security-note">
            <span className="login-security-dot" />
            <span>Secure sign-in</span>
            <span className="login-security-divider" />
            <span>Your account information stays protected</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login