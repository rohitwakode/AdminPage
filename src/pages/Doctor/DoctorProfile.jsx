
import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import uploadToCloudinary from '../../utils/uploadToCloudinary'

const DoctorProfile = () => {

  const {
    dToken,
    profileData,
    setProfileData,
    getProfileData,
    backendUrl
  } = useContext(DoctorContext)

  const { currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState('')

  useEffect(() => {
    if (!profileImagePreview) return undefined

    return () => URL.revokeObjectURL(profileImagePreview)
  }, [profileImagePreview])

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP images are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.')
      event.target.value = ''
      return
    }

    event.target.value = ''
    setProfileImageFile(file)
    setProfileImagePreview(URL.createObjectURL(file))
  }

  // Update Doctor Profile
  const updateProfile = async () => {

    try {

      if (!profileData) {
        toast.error('Profile data not available')
        return
      }

      if (!dToken) {
        toast.error('Please login as doctor')
        return
      }

      setLoading(true)

      const imageUrl = profileImageFile
        ? await uploadToCloudinary(profileImageFile)
        : profileData.docImage

      // Prepare complete update JSON
      const updateData = {

        user: {
          name: profileData.docName,
          email: profileData.email,
          image: imageUrl,
          phone: profileData.phone,
          gender: profileData.gender,
          dateOfBirth: profileData.dateOfBirth,
          password: profileData.password
        },

        addReq: {
          address: profileData.address?.address || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          pincode: profileData.address?.pincode || '',
          country: profileData.address?.country || '',
          latitude: profileData.address?.latitude ?? null,
          longitude: profileData.address?.longitude ?? null
        },

        speciality: profileData.speciality,
        degree: profileData.degree,
        experience: profileData.experience,
        about: profileData.about,

        // Availability status
        available: Boolean(profileData.available),

        fees: Number(profileData.fees)

      }

      console.log('Doctor Update JSON:', updateData)

      const { data } = await axios.put(
        `${backendUrl}/doctor`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Doctor Updated:', data)

      toast.success('Doctor profile updated successfully')

      setProfileData(prev => ({
        ...prev,
        docImage: imageUrl
      }))
      setIsEdit(false)
      setProfileImageFile(null)
      setProfileImagePreview('')

      // Reload updated profile
      await getProfileData()

    } catch (error) {

      console.log('Update Profile Error:', error)

      console.log(
        'Backend Error:',
        error.response?.data
      )

      toast.error(
        error.response?.data?.message ||
        error.response?.data ||
        error.message
      )

    } finally {

      setLoading(false)

    }

  }

  // Get Doctor Profile
  useEffect(() => {

    if (dToken) {
      getProfileData()
    }

  }, [dToken])

  // Loading
  if (!profileData) {

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">

        <p className="text-white text-lg">
          Loading Doctor Profile...
        </p>

      </div>
    )

  }

  return (

    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900 p-6">

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Image Section */}

        <div className="lg:w-1/3 bg-black/60 border border-gray-800 rounded-3xl p-4 backdrop-blur-xl shadow-[0_0_60px_rgba(59,130,246,0.25)]">

          {profileImagePreview || profileData.docImage ? (
            <img
              src={profileImagePreview || profileData.docImage}
              alt="Doctor profile"
              className="w-full h-full min-h-[350px] object-contain rounded-2xl"
            />
          ) : (
            <div className="flex min-h-[350px] items-center justify-center rounded-2xl bg-white/5 text-gray-400">
              No profile image
            </div>
          )}

          {isEdit && (
            <div className="mt-4">
              <label
                htmlFor="doctor-profile-image"
                className="inline-flex cursor-pointer items-center rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500 hover:bg-red-500/10"
              >
                {profileImageFile ? 'Choose a different image' : 'Change profile image'}
              </label>
              <input
                id="doctor-profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfileImageChange}
                disabled={loading}
                className="sr-only"
              />
              <p className="mt-2 text-xs text-gray-400">
                JPG, PNG or WEBP. Maximum file size: 5 MB.
              </p>
              {profileImageFile && (
                <p className="mt-1 truncate text-xs text-gray-300">
                  Selected: {profileImageFile.name}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Content Section */}

        <div className="flex-1 bg-black/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.25)]">

          {/* Name */}

          <h1 className="text-4xl font-bold text-white mb-2">
            {profileData.docName}
          </h1>

          {/* Degree */}

          <div className="flex flex-wrap items-center gap-3 text-gray-400">

            <p className="text-lg">
              {profileData.degree} - {profileData.speciality}
            </p>

            <span className="px-4 py-1 text-sm rounded-full bg-white/10 border border-gray-700">
              {profileData.experience}
            </span>

          </div>

          {/* About */}

          <div className="mt-8">

            <p className="text-lg font-semibold text-white mb-2">
              About
            </p>

            {isEdit ? (

              <textarea
                rows={5}
                className="w-full p-4 rounded-xl bg-black/50 border border-gray-700 text-gray-200 resize-none focus:outline-none"
                value={profileData.about || ''}
                onChange={(e) =>
                  setProfileData(prev => ({
                    ...prev,
                    about: e.target.value
                  }))
                }
              />

            ) : (

              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-gray-300">
                {profileData.about}
              </div>

            )}

          </div>

          {/* Fees */}

          <div className="mt-6">

            <p className="text-lg font-semibold text-white">

              Appointment Fee:

              <span className="ml-2 text-green-400">

                {currency}

                {isEdit ? (

                  <input
                    type="number"
                    min="0"
                    className="ml-2 w-28 p-2 rounded bg-black/50 border border-gray-700 text-gray-200 focus:outline-none"
                    value={profileData.fees ?? ''}
                    onChange={(e) =>
                      setProfileData(prev => ({
                        ...prev,
                        fees: e.target.value
                      }))
                    }
                  />

                ) : (

                  ` ${profileData.fees}`

                )}

              </span>

            </p>

          </div>

          {/* Address */}

          <div className="mt-6">

            <p className="text-lg font-semibold text-white">
              Address
            </p>

            {isEdit ? (

              <div className="space-y-3 mt-3">

                <input
                  type="text"
                  placeholder="Street Address"
                  className="w-full p-3 rounded bg-black/50 border border-gray-700 text-gray-200 focus:outline-none"
                  value={profileData.address?.address || ''}
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        address: e.target.value
                      }
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="City"
                  className="w-full p-3 rounded bg-black/50 border border-gray-700 text-gray-200 focus:outline-none"
                  value={profileData.address?.city || ''}
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        city: e.target.value
                      }
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="State"
                  className="w-full p-3 rounded bg-black/50 border border-gray-700 text-gray-200 focus:outline-none"
                  value={profileData.address?.state || ''}
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        state: e.target.value
                      }
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="Pincode"
                  className="w-full p-3 rounded bg-black/50 border border-gray-700 text-gray-200 focus:outline-none"
                  value={profileData.address?.pincode || ''}
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        pincode: e.target.value
                      }
                    }))
                  }
                />

                <input
                  type="text"
                  placeholder="Country"
                  className="w-full p-3 rounded bg-black/50 border border-gray-700 text-gray-200 focus:outline-none"
                  value={profileData.address?.country || ''}
                  onChange={(e) =>
                    setProfileData(prev => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        country: e.target.value
                      }
                    }))
                  }
                />

              </div>

            ) : (

              <div className="mt-3 bg-black/40 border border-gray-800 p-4 rounded-xl text-gray-300 space-y-1">

                <p>{profileData.address?.address}</p>

                <p>
                  {profileData.address?.city},
                  {' '}
                  {profileData.address?.state}
                </p>

                <p>{profileData.address?.pincode}</p>

                <p>{profileData.address?.country}</p>

              </div>

            )}

          </div>

          {/* Availability */}

          <div className="mt-6 flex items-center gap-3">

            <input
              type="checkbox"
              checked={Boolean(profileData.available)}
              disabled={!isEdit || loading}
              onChange={(e) =>
                setProfileData(prev => ({
                  ...prev,
                  available: e.target.checked
                }))
              }
              className="w-5 h-5 accent-green-500 cursor-pointer"
            />

            <label
              className={`font-semibold ${
                profileData.available
                  ? 'text-green-400'
                  : 'text-gray-400'
              }`}
            >

              {profileData.available
                ? 'Available for appointments'
                : 'Not available for appointments'}

            </label>

          </div>

          {/* Actions */}

          <div className="mt-10 flex flex-wrap gap-4">

            {isEdit ? (

              <>

                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="px-8 py-3 rounded-full bg-green-600/20 text-green-400 border border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:bg-green-600/30 disabled:opacity-50"
                >

                  {loading ? 'Saving...' : 'Save Changes'}

                </button>

                <button
                  onClick={async () => {
                    setIsEdit(false)
                    setProfileImageFile(null)
                    setProfileImagePreview('')
                    await getProfileData()
                  }}
                  disabled={loading}
                  className="px-8 py-3 rounded-full bg-red-600/20 text-red-400 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:bg-red-600/30 disabled:opacity-50"
                >

                  Cancel

                </button>

              </>

            ) : (

              <button
                onClick={() => setIsEdit(true)}
                className="px-8 py-3 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:bg-blue-600/30"
              >

                Edit Profile

              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  )

}

export default DoctorProfile
