import PropTypes from 'prop-types'
import { ToastContainer } from 'react-toastify'

const NotificationIcon = ({ type }) => {
  const iconColor = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }[type] || '#64748b'

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {type === 'success' ? (
        <path
          d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : type === 'error' ? (
        <path
          d="m5 5 8 8M13 5l-8 8"
          stroke={iconColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="9" cy="9" r="7" stroke={iconColor} strokeWidth="1.5" />
          <path
            d={type === 'warning' ? 'M9 5.5v4M9 12.5h.01' : 'M9 8v4M9 5.5h.01'}
            stroke={iconColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

NotificationIcon.propTypes = {
  type: PropTypes.string
}

const NotificationCloseButton = ({ closeToast }) => (
  <button
    type="button"
    aria-label="Close notification"
    className="notification-close-button"
    onClick={closeToast}
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="m3 3 8 8M11 3 3 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </button>
)

NotificationCloseButton.propTypes = {
  closeToast: PropTypes.func.isRequired
}

const Notification = () => (
  <ToastContainer
    position="top-right"
    autoClose={3500}
    hideProgressBar
    newestOnTop
    closeOnClick
    pauseOnFocusLoss
    draggable
    icon={NotificationIcon}
    closeButton={NotificationCloseButton}
    theme="light"
  />
)

export default Notification
