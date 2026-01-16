"use client";

import { useImagePreloader } from "@/components/providers/image-preloader";

export function LoadingScreen({ children }: { children: React.ReactNode }) {
  const { isLoading, progress, loadedImages, totalImages } = useImagePreloader();

  return (
    <>
      {children}
      {/* Non-blocking loading indicator at the bottom */}
      {isLoading && totalImages > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">BP</span>
            </div>
            <div className="space-y-1">
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Loading textures {loadedImages}/{totalImages}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
