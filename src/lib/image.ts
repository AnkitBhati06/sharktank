import "server-only";
import { getImgProps } from "next/dist/shared/lib/get-img-props";
import defaultLoader from "next/dist/shared/lib/image-loader";
import type { ImageProps } from "next/image";

/**
 * Same as `getImageProps` from "next/image" (identical srcset, sizes and
 * AVIF/WebP optimisation through /_next/image), but server-only: importing
 * "next/image" itself registers its client component, which would add ~5 KB to
 * every visitor's first-load JS for a logo that needs no client code.
 */
export function imageProps(props: ImageProps) {
  const { props: img } = getImgProps(props, {
    defaultLoader,
    // next injects this at build time, exactly as next/image does
    imgConf: process.env.__NEXT_IMAGE_OPTS as unknown as Parameters<typeof getImgProps>[1]["imgConf"],
  });
  for (const [k, v] of Object.entries(img)) if (v === undefined) delete (img as Record<string, unknown>)[k];
  return img;
}
