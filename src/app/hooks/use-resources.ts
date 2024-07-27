'use client'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ResourcesTypes } from '../types/types';
import { useEffect } from 'react';

interface MediaGalleryTypes {
  intialResources?: Array<ResourcesTypes>
  tag?: string
}

export function useResources(options?: MediaGalleryTypes){
  const queryClient = useQueryClient()
  const { data: resources, refetch } = useQuery({
    queryKey:['resources', options?.tag],
    queryFn: async () => {
      const {data} = await fetch('/api/resources').then(response => response.json());
      console.log("prefetch", data);
      return data;
    },
    initialData: options?.intialResources,
    enabled: false
  })

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addResourcesMutation = useMutation({
    mutationFn: (newResources: Array<ResourcesTypes>) => {
      // This is an optimistic update, so we don't actually call an API here
      return Promise.resolve(newResources);
    },
    onMutate: async (newResources) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)] })

      // Snapshot the previous value
      const previousResources = queryClient.getQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)])

      // Optimistically update to the new value
      queryClient.setQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)], (old: Array<ResourcesTypes> = []) => {
        return [...newResources, ...old]
      })

      // Return a context object with the snapshotted value
      return { previousResources }
    },
    onError: (err, newResources, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)], context?.previousResources)
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)] })
    },
  })
  
  function addResources(results: Array<ResourcesTypes>) {
    addResourcesMutation.mutate(results);
  }

  // function addResources(results: Array<ResourcesTypes>){
  //   queryClient.setQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)], (old: Array<ResourcesTypes>) => {
  //     return [...results, ...old]
  //   } )
  //   queryClient.invalidateQueries({queryKey:['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)]})
  // }

  
  return {
    resources,
    addResources
  }
}