
import {v2 as Cloudinary} from 'cloudinary';

Cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
export const runtime = 'edge';
export async function POST(request: Request) {
  const {url, publicId} = await request.json();

  const uploadOptions: Record<string, string | boolean | Array<string>> = {}
  if(typeof publicId === 'string'){
    uploadOptions.public_id = publicId
    uploadOptions.invalidate = true
  }else{
    uploadOptions.tags = [String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)]
  }
  const results = await Cloudinary.uploader.upload(url, uploadOptions);
  return Response.json({
    data: results
  })
  
}