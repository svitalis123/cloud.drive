import React from 'react'
import { Loader2Icon } from 'lucide-react'
const loading = () => {
  return (
    <div className='h-full w-full'>
      <div className='flex flex-col justify-center items-center h-full w-full'>
        <h2 className='text-2xl animate-pulse'>Getting Everything Ready</h2>
        <Loader2Icon  className=' animate-spin' />
      </div>
    </div>
  )
}

export default loading
