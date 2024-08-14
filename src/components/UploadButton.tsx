'use client'
import React from 'react';
import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { useResources } from '@/app/hooks/use-resources';
import { ResourcesTypes } from '@/app/types/types';

const UploadButton = () => {
  const { addResources } = useResources();
  const handleSucess = (results: CloudinaryUploadWidgetResults) => {
    addResources([results.info as ResourcesTypes])
  }
  return (
    <div>
      <CldUploadButton
      signatureEndpoint="/api/sign-cloudinary-params"
      options={{
        autoMinimize: true,
        tags: ['media']
      }}
      onSuccess={handleSucess}
      className='flex justify-center items-center'>
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16zm-5 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z" /></svg>
        Upload
      </CldUploadButton>

    </div>
  )
}
export const fetchCache = 'force-no-store';
export default UploadButton
