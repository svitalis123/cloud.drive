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

  // function addResources(results: Array<ResourcesTypes>){
  //   queryClient.setQueryData(['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)], (old: Array<ResourcesTypes>) => {
  //     return [...results, ...old]
  //   } )
  //   queryClient.invalidateQueries({queryKey:['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)]})
  // }

  // Create a new mutation instance that we'll use to update our resources in the query state

  const _addResources = useMutation({
    mutationFn: async (resources: Array<ResourcesTypes>) => {
      console.log(resources)
      return resources
    },
    onMutate: async (newResources) => {
      await queryClient.cancelQueries({ queryKey: ['resources'] })

      const previousResources = queryClient.getQueryData(['resources'])

      queryClient.setQueryData(['resources'], (old: Array<ResourcesTypes>) => [...newResources, ...old])

      return { previousResources }
    },
    onError: (err, newResources, context) => {
      queryClient.setQueryData(['resources'], context?.previousResources)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })

  // Wrap the mutation function to a simpler API for application calls

  function addResources(resources: Array<ResourcesTypes>) {
    _addResources.mutate(resources);
  }


  return {
    resources,
    addResources
  }
}