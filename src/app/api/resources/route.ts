import {v2 as Cloudinary} from 'cloudinary';

Cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


export async function GET(){
  const { resources } = await Cloudinary.api.resources_by_tag('media', {timestamp: new Date().getTime() })
 
  return Response.json({
    data: resources
  })
}
//  