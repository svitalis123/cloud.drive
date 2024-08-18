import MediaGallery from '@/components/MediaGallery';
import { v2 as Cloudinary } from 'cloudinary';
import { ResourcesTypes } from '../types/types';
import PhotoAppHome from '@/components/homepage/PhotoAppHome';

Cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


export default async function Home() {
  const { resources } = await Cloudinary.api.resources_by_tag(String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME));
  return (
    <div className="h-full mt-6">
      <PhotoAppHome />
      <MediaGallery
        resources={resources}
        tag={String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)}
      />
    </div>
  )
}