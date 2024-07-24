import {v2 as Cloudinary} from 'cloudinary';

Cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: Request){
  const { publicId } = await request.json();
  const results = await Cloudinary.api.delete_resources([publicId])
  Response.json({
    data: results
  })
}