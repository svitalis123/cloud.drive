'use client';

import {  useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Blend, ChevronLeft, ChevronDown, Crop, Info, Pencil, Trash2, Wand2, Image, Ban, PencilRuler, Replace, Loader2 } from 'lucide-react';

import Container from '@/components/Container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResourcesTypes } from '@/app/types/types';
import { CldImageProps, getCldImageUrl } from 'next-cloudinary';
import CldImage from './CldImage';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface Deletion {
  state: string;
}

interface Saving {
  state: string;
}

interface MediaProps {
  resource: Array<ResourcesTypes>
}

const MediaViewer = ({ resource }: MediaProps) => {
  const router = useRouter();
  const queryclient = useQueryClient();

  const sheetFiltersRef = useRef<HTMLDivElement | null>(null);
  const sheetInfoRef = useRef<HTMLDivElement | null>(null);
  // Sheet / Dialog UI state, basically controlling keeping them open or closed

  const [version, setVersion] = useState<number>(0);
  const [filterSheetIsOpen, setFilterSheetIsOpen] = useState(false);
  const [infoSheetIsOpen, setInfoSheetIsOpen] = useState(false);
  const [deletion, setDeletion] = useState<Deletion>();
  const [saving, setSaving]=useState<Saving>();
  const [enhance, setEnhance] = useState<string>();
  const [crop, setCrop] = useState<string>();
  const [ filter, setFilter] = useState<string>();
 
  const handleEnhance = (transformation: string) => {
    setEnhance(transformation);
  }

  const handleCrop = (crop: string) => {
    setCrop(crop);
  }

  type Transformation = Omit<CldImageProps, 'src' | 'alt'>
  const transformation:Transformation = {}
  if(enhance === 'restore'){
    transformation.restore = true
  }else if (enhance === 'enhance'){
    transformation.enhance = true
  }else if (enhance === 'removeBackground'){
    transformation.removeBackground = true
  }

  if(crop === 'square'){
    if(resource[0].width > resource[0].height){
      transformation.height = resource[0].width
    }else {
      transformation.width = resource[0].height
    }

    transformation.crop = {
      source: true,
      type: 'fill'
    }
  } else if (crop === 'landscape'){
    transformation.height = Math.floor(resource[0].width / (16/9))
    transformation.crop = {
      source: true,
      type: 'fill'
    }
  } else if (crop === 'portrait'){
    transformation.width = Math.floor(resource[0].height / (16/9));
    transformation.crop = {
      source: true,
      type: 'fill'
    }
  }

  if(typeof filter === "string" && ['grayscale', 'sepia'].includes(filter)){
    transformation[filter as keyof Transformation] = true
  }else if (typeof filter === "string" && ['sizzle', 'sonnet'].includes(filter)){
    transformation.art = filter
  }

  // length of transformations

  const hasTransformations = Object.entries(transformation).length > 0;
  // Canvas sizing based on the image dimensions. The tricky thing about
  // showing a single image in a space like this in a responsive way is trying
  // to take up as much room as possible without distorting it or upscaling
  // the image. Since we have the resource width and height, we can dynamically
  // determine whether it's landscape, portrait, or square, and change a little
  // CSS to make it appear centered and scalable!

  const canvasHeight =  transformation.height || resource[0].height;
  const canvasWidth = transformation.width || resource[0].width;

  const isSquare = canvasHeight === canvasWidth;
  const isLandscape = canvasWidth > canvasHeight;
  const isPortrait = canvasHeight > canvasWidth;

  const imgStyles: Record<string, string | number> = {};

  if ( isLandscape ) {
    imgStyles.maxWidth = resource[0].width;
    imgStyles.width = '100%';
    imgStyles.height = 'auto';
  } else if ( isPortrait || isSquare ) {
    imgStyles.maxHeight = resource[0].height;
    imgStyles.height = '100vh';
    imgStyles.width = 'auto'
  }

  /**
   * closeMenus
   * @description Closes all panel menus and dialogs
   */

  function closeMenus() {
    setFilterSheetIsOpen(false)
    setInfoSheetIsOpen(false)
    setDeletion(undefined)
  }

   /**
   * resetTransformations
   */


  function resetTransformations() {
    setCrop(undefined)
    setEnhance(undefined)
    setFilter(undefined)
  }

  /**
   * handleOnDeletionOpenChange
   */

  function handleOnDeletionOpenChange(isOpen: boolean) {
    // Reset deletion dialog if the user is closing it
    if ( !isOpen ) {
      setDeletion(undefined);
    }
  }

   /**
   * handlesave
   */

   async function handleSave(){
    if(saving?.state === 'saving'){
      return
    }
    setSaving({state: 'saving'});
    const url = getCldImageUrl({
      width: resource[0].width,
      height: resource[0].height,
      src: resource[0].public_id,
      format: 'default',
      quality: 'default',
      ...transformation
    })

    await fetch(url)

    try {
      const results  = await fetch('/api/saver', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({
          publicId: resource[0].public_id,
          url        
        })
      }).then(response => response.json())
  
      invalidatequeries();
      resetTransformations();
      closeMenus();
      setVersion(Date.now());
    } catch (error) {
      console.error(error)
    }
    
   }

   async function handleSaveCopy(){
    if(saving?.state === 'savingcopy'){
      return
    }
    setSaving({state: 'savingcopy'});
    const url = getCldImageUrl({
      width: resource[0].width,
      height: resource[0].height,
      src: resource[0].public_id,
      format: 'default',
      quality: 'default',
      ...transformation
    })

    await fetch(url)

    try {
      const {data}  = await fetch('/api/saver', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({
          url        
        })
      }).then(response => response.json())
      invalidatequeries()
      router.push(`/resources/${data.asset_id}`)
    } catch (error) {
      console.error(error)
    }
   }


  //  handle deletion  of assets

  async function handleDelete(){
    if(deletion?.state === 'deleting'){
      return
    }
    setDeletion({state: 'deleting'});
    try {
      const results = await fetch('/api/deleteasset', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({
          publicId: resource[0].public_id
        })
      })
      invalidatequeries();
      router.push('/')
    } catch (error) {
      console.error(error)
    }
    
  }


  // function to invalidate queries using isequeryclient

  function invalidatequeries(){
    queryclient.invalidateQueries({queryKey: ['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_TAG_NAME)]})
  }

  // Listen for clicks outside of the panel area and if determined
  // to be outside, close the panel. This is marked by using
  // a data attribute to provide an easy way to reference it on
  // multiple elements

  useEffect(() => {
    document.body.addEventListener('click', handleOnOutsideClick)
    return () => {
      document.body.removeEventListener('click', handleOnOutsideClick)
    }
  }, []);

  function handleOnOutsideClick(event: MouseEvent) {
    const excludedElements = Array.from(document.querySelectorAll('[data-exclude-close-on-click="true"]'));
    const clickedExcludedElement = excludedElements.filter(element => event.composedPath().includes(element)).length > 0;

    if ( !clickedExcludedElement ) {
      closeMenus();
    }
  }

  return (
    <div className="h-screen bg-black px-0">

      {/** Modal for deletion */}

      <Dialog open={deletion && ['confirm', 'deleting'].includes(deletion.state)} onOpenChange={handleOnDeletionOpenChange}>
        <DialogContent data-exclude-close-on-click={true}>
          <DialogHeader>
            <DialogTitle className="text-center">Are you sure you want to delete?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="justify-center sm:justify-center">
            <Button variant="destructive" onClick={handleDelete}>
              {
                deletion?.state === 'deleting' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />
              }
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/** Edit panel for transformations and filters */}

      <Sheet modal={false} open={filterSheetIsOpen}>
        <SheetContent
          ref={sheetFiltersRef}
          className="w-full sm:w-3/4 grid grid-rows-[1fr_auto] bg-zinc-800 text-white border-0"
          data-exclude-close-on-click={true}
        >
          <Tabs defaultValue="account">
            <TabsList className="grid grid-cols-3 w-full bg-transparent p-0">
              <TabsTrigger value="enhance">
                <Wand2 />
                <span className="sr-only">Enhance</span>
              </TabsTrigger>
              <TabsTrigger value="crop">
                <Crop />
                <span className="sr-only">Crop & Resize</span>
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Blend />
                <span className="sr-only">Filters</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enhance">
              <SheetHeader className="my-4">
                <SheetTitle className="text-zinc-400 text-sm font-semibold">Enhancements</SheetTitle>
              </SheetHeader>
              <ul className="grid gap-2">
                <li >
                  <Button
                  variant="ghost"
                  onClick={() => handleEnhance('undefined')}
                  className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${!enhance ? 'border-white bg-white text-zinc-700' : 'border-white' }`}>
                    <Ban className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">None</span>
                  </Button>
                  <Button 
                  variant="ghost"
                  onClick={() => handleEnhance('restore')}
                  className={`text-left justify-start mt-2 w-full h-14 border-4 bg-zinc-700 ${enhance === "restore" ? 'border-white bg-white text-zinc-700' : 'border-white' }`}>
                    <PencilRuler className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">Restore</span>
                  </Button>
                  <Button 
                  variant="ghost" 
                  onClick={() => handleEnhance('enhance')}
                  className={`text-left justify-start mt-2 w-full h-14 border-4 bg-zinc-700 ${enhance === "enhance" ? 'border-white bg-white text-zinc-700' : 'border-white' }`}>
                    <Wand2 className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">enhance</span>
                  </Button>
                  <Button 
                  variant="ghost"
                  onClick={() => handleEnhance('removeBackground')}
                  className={`text-left justify-start mt-2 w-full h-14 border-4 bg-zinc-700 ${enhance === "removeBackground" ? 'border-white bg-white text-zinc-700' : 'border-white' }`}>
                    <Replace className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">removeBackground</span>
                  </Button>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="crop">
              <SheetHeader className="my-4">
                <SheetTitle className="text-zinc-400 text-sm font-semibold">Cropping & Resizing</SheetTitle>
              </SheetHeader>
              <ul className="grid gap-2">
                <li>
                  <Button variant="ghost" className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${!crop ? 'border-white bg-white text-zinc-700' : 'border-white' }`}
                  onClick={() => handleCrop('undefined')}
                  >
                    <Image className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">Original</span>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${crop === "square" ? 'border-white bg-white text-zinc-700' : 'border-white' }`}
                   onClick={() => handleCrop('square')}
                  >
                    <Image className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">Square</span>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${crop === "landscape" ? 'border-white bg-white text-zinc-700' : 'border-white' }`}
                    onClick={() => handleCrop('landscape')}
                  >
                    <Image className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">Landscape</span>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${crop === "portrait" ? 'border-white bg-white text-zinc-700' : 'border-white' }`}
                   onClick={() => handleCrop('portrait')}
                  >
                    <Image className="w-5 h-5 mr-3" />
                    <span className="text-[1.01rem]">Portrait</span>
                  </Button>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="filters">
              <SheetHeader className="my-4">
                <SheetTitle className="text-zinc-400 text-sm font-semibold">Filters</SheetTitle>
              </SheetHeader>
              <ul className="grid grid-cols-2 gap-2">
                <li>
                  <button
                    className={`w-full border-4 ${!filter ? 'border-white bg-white text-zinc-700' : 'border-transparent' }`}
                    onClick={() => setFilter(undefined)}
                    >
                    <CldImage
                      key={JSON.stringify(transformation)}
                      width={156}
                      height={156}
                      crop="fill"
                      src={resource[0].secure_url}
                      sizes="(max-width: 768px) 50vw,
                      (max-width: 1200px) 33vw,
                      25vw"
                      alt={`image ${resource[0].public_id}`}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full border-4 ${filter === "sepia" ? 'border-white bg-white text-zinc-700' : 'border-transparent' }`}
                    onClick={() => setFilter('sepia')}
                    >
                    <CldImage
                      key={JSON.stringify(transformation)}
                      width={156}
                      sepia
                      height={156}
                      crop="fill"
                      src={resource[0].secure_url}
                      sizes="(max-width: 768px) 50vw,
                      (max-width: 1200px) 33vw,
                      25vw"
                      alt={`image ${resource[0].public_id}`}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full border-4 ${filter === "sonnet" ? 'border-white bg-white text-zinc-700' : 'border-transparent' }`}
                    onClick={() => setFilter('sonnet')}
                    >
                    <CldImage
                      key={JSON.stringify(transformation)}  
                      width={156}
                      art='sonnet'
                      height={156}
                      crop="fill"
                      src={resource[0].secure_url}
                      sizes="(max-width: 768px) 50vw,
                      (max-width: 1200px) 33vw,
                      25vw"
                      alt={`image ${resource[0].public_id}`}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full border-4 ${filter === "grayscale" ? 'border-white bg-white text-zinc-700' : 'border-transparent' }`}
                    onClick={() => setFilter('grayscale')}
                    >
                    <CldImage
                      key={JSON.stringify(transformation)}
                      width={156}
                      grayscale
                      height={156}
                      crop="fill"
                      src={resource[0].secure_url}
                      sizes="(max-width: 768px) 50vw,
                      (max-width: 1200px) 33vw,
                      25vw"
                      alt={`image ${resource[0].public_id}`}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full border-4 ${filter === "sizzle" ? 'border-white bg-white text-zinc-700' : 'border-transparent' }`}
                    onClick={() => setFilter('sizzle')}
                    >
                    <CldImage
                      key={JSON.stringify(transformation)}
                      width={156}
                      art='sizzle'
                      height={156}
                      crop="fill"
                      src={resource[0].secure_url}
                      sizes="(max-width: 768px) 50vw,
                      (max-width: 1200px) 33vw,
                      25vw"
                      alt={`image ${resource[0].public_id}`}
                    />
                  </button>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
          <SheetFooter className="gap-2 sm:flex-col">
            {
              hasTransformations ? 
              <div className="grid grid-cols-[1fr_4rem] gap-2">
              <Button
                variant="ghost"
                onClick={handleSave}
                className="w-full h-14 text-left justify-center items-center bg-blue-500"
              >
                <span className="text-[1.01rem]">
                  {
                    saving?.state === 'saving' ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Save'
                  }
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-14 text-left justify-center items-center bg-blue-500"
                  >
                    <span className="sr-only">More Options</span>
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" onClick={handleSaveCopy} data-exclude-close-on-click={true}>
                  <DropdownMenuGroup>
                    <DropdownMenuItem >
                      <span>
                        {
                          saving?.state === 'savingcopy' ? <Loader2 className='w-5 h-5 animate-spin' /> : ' Save as Copy'
                        }                       
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            :
            ''
            }
            
            <Button
              variant="outline"
              className={`w-full h-14 text-left justify-center items-center bg-transparent border-zinc-600 ${hasTransformations ? 'bg-red-500 hover:bg-red-400 hover:text-[#fff]':'bg-transparent'}`}
              onClick={() => {
                closeMenus()
                resetTransformations()
              }}
            >
              <span className="text-[1.01rem]">
                {hasTransformations ? 'Cancel' : 'Close'}
              </span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/** Info panel for asset metadata */}

      <Sheet modal={false} open={infoSheetIsOpen}>
        <SheetContent
          ref={sheetInfoRef}
          className="w-full sm:w-3/4 grid grid-rows-[auto_1fr_auto] bg-zinc-800 text-white border-0"
          data-exclude-close-on-click={true}
        >
          <SheetHeader className="my-4">
            <SheetTitle className="text-zinc-200 font-semibold">Info</SheetTitle>
          </SheetHeader>
          <div>
            <ul>
              <li className="mb-3">
                <strong className="block text-xs font-normal text-zinc-400 mb-1">ID</strong>
                <span className="flex gap-4 items-center text-zinc-100">
                  { resource[0].public_id }
                </span>
              </li>
            </ul>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              className="w-full h-14 text-left justify-center items-center bg-transparent border-zinc-600"
              onClick={() => closeMenus()}
            >
              <span className="text-[1.01rem]">Close</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/** Asset management navbar */}

      <Container className="fixed z-10 top-0 left-0 w-full h-16 flex items-center justify-between gap-4 bg-gradient-to-b from-black">
        <div className="flex items-center gap-4">
          <ul>
            <li>
              <Link href="/" className={`${buttonVariants({ variant: "ghost" })} text-white`}>
                <ChevronLeft className="h-6 w-6" />
                Back
              </Link>
            </li>
          </ul>
        </div>
        <ul className="flex items-center gap-4">
          <li>
            <Button variant="ghost" className="text-white" onClick={() => setFilterSheetIsOpen(true)}>
              <Pencil className="h-6 w-6" />
              <span className="sr-only">Edit</span>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="text-white" onClick={() => setInfoSheetIsOpen(true)}>
              <Info className="h-6 w-6" />
              <span className="sr-only">Info</span>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="text-white" onClick={() => setDeletion({ state: 'confirm' })}>
              <Trash2 className="h-6 w-6" />
              <span className="sr-only">Delete</span>
            </Button>
          </li>
        </ul>
      </Container>

      {/** Asset viewer */}

      <div className="relative flex justify-center items-center align-center w-full h-full">
        <CldImage
          className="object-contain"
          key={`${JSON.stringify(transformation)}-${version}`}
          width={resource[0].width}
          height={resource[0].height}
          src={resource[0].secure_url}
          version={version}
          // sizes="(max-width: 768px) 50vw,
          // (max-width: 1200px) 33vw,
          // 25vw"
          {...transformation}
          alt={`image ${resource[0].public_id}`}
          style={imgStyles}
        />
      </div>
    </div>
  )
};

export default MediaViewer;