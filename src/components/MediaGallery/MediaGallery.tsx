"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, Save, Crop, Loader2 } from "lucide-react";
import CldImage from "../MediaViewer/CldImage";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ResourcesTypes } from "@/app/types/types";
import { useResources } from "@/app/hooks/use-resources";
import Creationoverlay from "@/lib/creation";

interface MediaGalleryProps {
  resources: Array<ResourcesTypes>;
  tag: string;
}

interface Creation {
  state: string;
  url: string;
  type: string;
}

const MediaGallery = ({
  resources: intialResources,
  tag,
}: MediaGalleryProps) => {
  const { resources, addResources } = useResources({ intialResources, tag });
  const [selected, setSelected] = useState<Array<string>>([]);
  const [creation, setCreation] = useState<Creation>();

  /**
   *handle creation function
   */

  function handleCollageCreation() {
    if(selected.length > 4) return;
    setCreation({
      state: "created",
      url: Creationoverlay(selected),
      type: "collage",
    });
  }

  /**
   * handle on save creation
   */

  async function handleSaveCreation(){
    
    if( typeof creation?.url !== 'string' || creation.state === "creating"){
      return;
    }
    
    setCreation((prev) => {
      if (!prev) return;
       return {
       ...prev,
       state: 'creating'
      }
     })
   
    await fetch(creation?.url);

    const { data } = await fetch('/api/saver', {
      method: 'POST',
      body: JSON.stringify({
        url: creation.url
      })
    }).then(response => response.json())
    addResources([data]);
    setCreation(undefined);
    setSelected([]);
  }


  /**
   * handleOnClearSelection
   */

  function handleOnClearSelection() {
    setSelected([]);
  }

  /**
   * handleOnCreationOpenChange
   */

  function handleOnCreationOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setCreation(undefined);
    }
  }

  return (
    <>
      {/** Popup modal used to preview and confirm new creations */}

      <Dialog open={!!creation} onOpenChange={handleOnCreationOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your creation?</DialogTitle>
          </DialogHeader>
          {
            creation?.url && (
              <CldImage 
                src={creation?.url}
                height="1200"
                width="1200"
                alt="collage image"
                preserveTransformations
                crop={
                  {
                    type: 'fill',
                    source: true
                  }
                }
              />
            )
          }
          <DialogFooter className="justify-end sm:justify-end">
            <Button onClick={handleSaveCreation}>
              {
                creation?.state === 'creating' ? 
                (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ):
                (
                  <Save className="h-4 w-4 mr-2" />
                )
              }
              Save to Library
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/** Management navbar presented when assets are selected */}

      {selected.length > 0 && (
        <Container className="fixed z-50 top-0 left-0 w-full h-16 flex items-center justify-between gap-4 bg-white shadow-lg">
          <div className="flex items-center gap-4">
            <ul>
              <li>
                <Button variant="ghost" onClick={handleOnClearSelection}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Clear Selected</span>
                </Button>
              </li>
            </ul>
            <p>
              <span>{selected?.length} Selected</span>
            </p>
          </div>
          <ul className="flex items-center gap-4">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Create New</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    {
                      selected.length > 1 && (
                        <DropdownMenuItem onClick={handleCollageCreation}>
                          <span>Collage</span>
                        </DropdownMenuItem>
                      )
                    }
                    
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </Container>
      )}

      {/** Gallery */}

      <Container>
        <form>
          {Array.isArray(resources) && (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-12">
              {resources.map((resource) => {
                const isChecked = selected.includes(resource.public_id);

                function handleOnSelectResource(checked: boolean) {
                  setSelected((prev) => {
                    if (checked) {
                      return Array.from(
                        new Set([...(prev || []), resource.public_id])
                      );
                    } else {
                      return prev.filter((id) => id !== resource.public_id);
                    }
                  });
                }

                return (
                  <li
                    key={resource.public_id}
                    className="bg-white dark:bg-zinc-700"
                  >
                    <div className="relative group">
                      <label
                        className={`absolute ${
                          isChecked ? "opacity-100" : "opacity-0"
                        } group-hover:opacity-100 transition-opacity top-3 left-3 p-1`}
                        htmlFor={resource.public_id}
                      >
                        <span className="sr-only">
                          Select Image &quot;{resource.public_id}&quot;
                        </span>
                        <Checkbox
                          className={`w-6 h-6 rounded-full bg-white shadow ${
                            isChecked ? "border-blue-500" : "border-zinc-200"
                          }`}
                          id={resource.public_id}
                          onCheckedChange={handleOnSelectResource}
                          checked={isChecked}
                        />
                      </label>
                      <Link
                        className={`block cursor-pointer border-8 transition-[border] ${
                          isChecked ? "border-blue-500" : "border-white"
                        }`}
                        href={`/resources/${resource.asset_id}`}
                      >
                        <CldImage
                          width={resource.width}
                          height={resource.height}
                          src={resource.secure_url}
                          // sizes="(max-width: 768px) 50vw,
                          // (max-width: 1200px) 33vw,
                          // 25vw"
                          alt={`image ${resource.secure_url}`}
                        />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </form>
      </Container>
    </>
  );
};

export default MediaGallery;
