import { useState, useEffect } from 'react'
import { HiOutlineTrash, HiOutlineUpload, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const HeroVideosAdmin = () => {
  const [videos, setVideos] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const fetchVideos = async () => {
    try {
      const res = await api.get('/hero-videos/all')
      setVideos(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load videos')
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      return toast.error('Please select a video file')
    }

    const formData = new FormData()
    formData.append('video', file)
    // Auto-generate title from filename (backend still requires it)
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

    setUploading(true)
    setProgress(0)

    try {
      await api.post('/hero-videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total))
        },
      })
      toast.success('Video uploaded successfully!')
      setFile(null)
      fetchVideos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const toggleActive = async (video) => {
    try {
      await api.put(`/hero-videos/${video._id}`, { isActive: !video.isActive })
      fetchVideos()
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const deleteVideo = async (id) => {
    if (!window.confirm('Delete this video?')) return
    try {
      await api.delete(`/hero-videos/${id}`)
      toast.success('Deleted')
      fetchVideos()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-chocolate-900 mb-6">
        Hero Videos Management
      </h1>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4"
      >
        <h2 className="text-xl font-semibold text-chocolate-800">Upload New Video</h2>

        <div>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-chocolate-300 rounded-lg p-6 cursor-pointer hover:bg-cream-50 transition">
            <HiOutlineUpload className="w-6 h-6 text-chocolate-600" />
            <span className="text-chocolate-700">
              {file ? file.name : 'Click to select video (MP4, max 100MB)'}
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-chocolate-700 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-chocolate-800 hover:bg-chocolate-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 transition"
        >
          {uploading ? `Uploading... ${progress}%` : 'Upload Video'}
        </button>
      </form>

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <video
              src={video.videoUrl}
              poster={video.thumbnail}
              controls
              className="w-full aspect-square object-cover bg-black"
            />
            <div className="p-4">
              <p className="text-xs text-chocolate-500 mb-3">
                {video.isActive ? '🟢 Active' : '⚪ Hidden'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(video)}
                  className="flex-1 flex items-center justify-center gap-1 bg-cream-100 hover:bg-cream-200 text-chocolate-800 py-2 rounded-lg text-sm font-medium transition"
                >
                  {video.isActive ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  {video.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => deleteVideo(video._id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium transition"
                >
                  <HiOutlineTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="text-center text-chocolate-500 py-12">
          No videos uploaded yet.
        </p>
      )}
    </div>
  )
}

export default HeroVideosAdmin