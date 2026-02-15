import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  className?: string;
  fallback?: string;
}

/**
 * OptimizedImage component for Supabase Storage images
 * Automatically applies image transformations for better performance
 * - Resizing to target width
 * - Quality compression
 * - WebP format when supported
 */
export function OptimizedImage({
  src,
  alt,
  width = 400,
  quality = 75,
  className,
  fallback = '/placeholder.svg',
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Generate optimized URL for Supabase Storage images
  const getOptimizedUrl = (url: string) => {
    if (!url) return fallback;
    
    // If it's a Supabase Storage URL, add transformation parameters
    if (url.includes('supabase.co/storage')) {
      // Use render endpoint for automatic image transformation
      const renderUrl = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
      return `${renderUrl}?width=${width}&quality=${quality}`;
    }
    
    // For external URLs, return as-is (or could use a proxy/CDN)
    return url;
  };

  const optimizedSrc = getOptimizedUrl(imgSrc);

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setImgSrc(fallback);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  );
}
