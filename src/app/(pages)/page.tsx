import MediaGallery from '@/components/MediaGallery';
import { v2 as Cloudinary } from 'cloudinary';
import { ResourcesTypes } from '../types/types';

Cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


export default async function Home() {
  const { resources } = await Cloudinary.api.resources_by_tag(String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME));
  console.log("server data", resources);
  return (
    <div className="h-full mt-6">
      <MediaGallery
        resources={resources}
        tag={String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)}
      />
    </div>
  )
}