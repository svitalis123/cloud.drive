import MediaViewer from '@/components/MediaViewer';
import {v2 as Cloudinary} from 'cloudinary';

Cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
async function Resource({params}: {params: {assetid: string}}) {
  const {resources} = await Cloudinary.api.resources_by_asset_ids([params.assetid]);
  return (
    <MediaViewer
      resource={resources}
    />
  );
}

export default Resource;