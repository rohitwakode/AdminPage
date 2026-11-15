import { createElement } from 'react'
import { toast as reactToast } from 'react-toastify'

const titlesByType = {
  error: 'Error',
  info: 'Notice',
  success: 'Success',
  warning: 'Warning'
}

const getMessageText = (message) => {
  if (typeof message === 'string' || typeof message === 'number') {
    return String(message)
  }

  if (message && typeof message === 'object') {
    if (typeof message.message === 'string') return message.message
    return JSON.stringify(message)
  }

  return ''
}

const showNotification = (type, message, options) => {
  const content = createElement(
    'div',
    { className: 'notification-content' },
    createElement('h3', { className: 'notification-title' }, titlesByType[type]),
    createElement('p', { className: 'notification-message' }, getMessageText(message))
  )

  return reactToast[type](content, options)
}

export const toast = {
  error: (message, options) => showNotification('error', message, options),
  info: (message, options) => showNotification('info', message, options),
  success: (message, options) => showNotification('success', message, options),
  warning: (message, options) => showNotification('warning', message, options)
}

export const showErrorNotification = (message) => toast.error(message)
export const showSuccessNotification = (message) => toast.success(message)
