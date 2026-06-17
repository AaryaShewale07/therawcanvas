import { GalleryManager } from '../../components/admin/Dashboard'
// or wherever you exported it from

const GalleryAdmin = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-chocolate-900">
          Gallery Management
        </h1>
        <p className="text-chocolate-500 mt-1">
          Upload event photos and customer testimonials
        </p>
      </div>
      <GalleryManager />
    </div>
  )
}

export default GalleryAdmin