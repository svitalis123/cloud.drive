import { getCldImageUrl } from "next-cloudinary";

const OverlayTemplate: Record<number, Function> = {
  2: (publicids: Array<string>) => {
    return {
      overlays: [
        {
          publicId: publicids[0],
          position: {
            gravity: "west",
          },
          effects: [
            {
              crop: "fill",
              height: 1200,
              width: 600,
              gravity: "auto",
            },
          ],
        },
        {
          publicId: publicids[1],
          position: {
            gravity: "east",
          },
          effects: [
            {
              crop: "fill",
              height: 1200,
              width: 600,
              gravity: "auto",
            },
          ],
        },
      ],
    };
  },
  3: (publicids: Array<string>) => {
    return {
      overlays: [
        {
          publicId: publicids[0],
          position: {
            gravity: "west",
          },
          effects: [
            {
              crop: "fill",
              height: 1200,
              width: 600,
              gravity: "auto",
            },
          ],
        },
        {
          publicId: publicids[1],
          position: {
            gravity: "north_east",
          },
          effects: [
            {
              crop: "fill",
              height: 600,
              width: 600,
              gravity: "auto",
            },
          ],
        },
        {
          publicId: publicids[2],
          position: {
            gravity: "south_east",
          },
          effects: [
            {
              crop: "fill",
              height: 600,
              width: 600,
              gravity: "auto",
            },
          ],
        },
      ],
    };
  },
  4: (publicids: Array<string>) => {
    return {
      overlays: [
        {
          publicId: publicids[0],
          position: {
            gravity: "north_west",
          },
          effects: [
            {
              crop: "fill",
              height: 600,
              width: 600,
              gravity: "auto",
            },
          ],
        },
        {
          publicId: publicids[1],
          position: {
            gravity: "south_west",
          },
          effects: [
            {
              crop: "fill",
              height: 600,
              width: 600,
              gravity: "auto",
            },
          ],
        },
        {
          publicId: publicids[2],
          position: {
            gravity: "north_east",
          },
          effects: [
            {
              crop: "fill",
              height: 600,
              width: 600,
              gravity: "auto",
            },
          ],
        },
        {
          publicId: publicids[3],
          position: {
            gravity: "south_east",
          },
          effects: [
            {
              crop: "fill",
              height: 600,
              width: 600,
              gravity: "auto",
            },
          ],
        },
      ],
    };
  },
};

export default function Creationoverlay(publicids: Array<string>) {
  const template = OverlayTemplate[publicids.length];
  
  if (!template) {
    throw new Error();
  }
  const url = getCldImageUrl({
    width: 1200,
    height: 1200,
    version: Date.now(),
    crop: {
      type: "fill",
      source: true,
    },
    src: publicids[0],
    effects: [
      {
        colorize: "100,co_white",
        background: "white"
      },
    ],
    ...template(publicids),
  });
  return url;
}
