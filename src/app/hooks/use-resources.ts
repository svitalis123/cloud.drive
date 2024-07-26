'use client'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ResourcesTypes } from '../types/types';

interface MediaGalleryTypes {
  intialResources?: Array<ResourcesTypes>
  tag?: string
}

export function useResources(options?: MediaGalleryTypes){
  const queryClient = useQueryClient()
  const { data: resources } = useQuery({
    queryKey:['resources', options?.tag],
    queryFn: async () => {
      const {data} = await fetch('/api/resources').then(response => response.json());
      console.log("prefetch", data);
      return data;
    },
    initialData: options?.intialResources
  })

  function addResources(results: Array<ResourcesTypes>){
    queryClient.setQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)], (old: Array<ResourcesTypes>) => {
      return [...results, ...old]
    } )
    queryClient.invalidateQueries({queryKey:['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)]})
  }

  
  return {
    resources,
    addResources
  }
}