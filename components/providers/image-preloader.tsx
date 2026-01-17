"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { getBlockImageUrl } from "@/lib/images";
import { BLOCKS } from "@/lib/blocks";

interface ImagePreloaderContextType {
  isLoading: boolean;
  progress: number;
  totalImages: number;
  loadedImages: number;
}

const ImagePreloaderContext = createContext<ImagePreloaderContextType>({
  isLoading: true,
  progress: 0,
  totalImages: 0,
  loadedImages: 0,
});

export function useImagePreloader() {
  return useContext(ImagePreloaderContext);
}

interface ImagePreloaderProviderProps {
  children: React.ReactNode;
}

export function ImagePreloaderProvider({ children }: ImagePreloaderProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  useEffect(() => {
    // Use static blocks data - no Convex query needed
    if (BLOCKS.length === 0) {
      setIsLoading(false);
      return;
    }

    const imagesToLoad = BLOCKS.map((block) => getBlockImageUrl(block.slug));
    setTotalImages(imagesToLoad.length);

    let loaded = 0;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          setLoadedImages(loaded);
          resolve();
        };
        img.onerror = () => {
          loaded++;
          setLoadedImages(loaded);
          resolve();
        };
        img.src = src;
      });
    };

    // Load images in batches to avoid overwhelming the browser
    const batchSize = 20;
    const loadBatch = async (startIndex: number) => {
      const batch = imagesToLoad.slice(startIndex, startIndex + batchSize);
      await Promise.all(batch.map(preloadImage));

      if (startIndex + batchSize < imagesToLoad.length) {
        // Continue with next batch
        await loadBatch(startIndex + batchSize);
      } else {
        // All images loaded
        setIsLoading(false);
      }
    };

    loadBatch(0);
  }, []);

  const progress = totalImages > 0 ? (loadedImages / totalImages) * 100 : 0;

  return (
    <ImagePreloaderContext.Provider
      value={{ isLoading, progress, totalImages, loadedImages }}
    >
      {children}
    </ImagePreloaderContext.Provider>
  );
}
