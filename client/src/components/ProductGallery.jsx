import { X, ZoomIn } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { imageUrl, useImageFallback } from '../lib/catalog';
import { getMotionVariants } from '../motion/variants';
import useFinePointer from '../hooks/useFinePointer';

export default function ProductGallery({
  product,
  images,
  selectedImage,
  onSelectImage,
  previewOpen,
  onPreviewChange,
}) {
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const selected = images[selectedImage];
  const hasFinePointer = useFinePointer();

  useEffect(() => {
    if (!previewOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onPreviewChange(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onPreviewChange, previewOpen]);

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="rigora-panel rigora-gallery-image group relative overflow-hidden bg-zinc-950">
        {selected ? (
          <button
            type="button"
            className="block w-full cursor-zoom-in"
            onClick={() => onPreviewChange(true)}
            aria-label={`Open full-size image of ${product.name}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={selected}
                src={imageUrl(selected)}
                alt={product.name}
                onError={useImageFallback}
                className="aspect-square w-full object-cover"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.012 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={
                  hasFinePointer && !reduceMotion ? { scale: 1.025 } : undefined
                }
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.992 }}
                transition={{
                  duration: reduceMotion ? 0.01 : 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </AnimatePresence>
          </button>
        ) : (
          <div className="grid aspect-square place-items-center text-zinc-600">
            Rigora
          </div>
        )}
        {selected && (
          <button
            type="button"
            onClick={() => onPreviewChange(true)}
            aria-label="Open image preview"
            className="rigora-control absolute bottom-4 right-4 border border-white/15 bg-zinc-950/95 p-3"
          >
            <ZoomIn size={18} />
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-auto pb-1" aria-label="Product images">
          {images.map((image, index) => {
            const selectedThumbnail = selectedImage === index;
            return (
              <button
                key={image}
                type="button"
                onClick={() => onSelectImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={selectedThumbnail ? 'true' : undefined}
                className="rigora-control relative h-20 w-20 shrink-0 overflow-hidden border border-white/10"
              >
                {selectedThumbnail && (
                  <motion.span
                    layoutId="rigora-selected-product-thumbnail"
                    className="absolute inset-0 z-10 rounded-[inherit] border-2 border-cyan-300"
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                )}
                <img
                  src={imageUrl(image)}
                  alt={`${product.name} ${index + 1}`}
                  onError={useImageFallback}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
      <AnimatePresence>
        {previewOpen && selected && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-5"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants.fadeIn}
            onClick={() => onPreviewChange(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${product.name} image preview`}
              className="rigora-glass rigora-floating-surface relative max-h-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl"
              variants={variants.scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={imageUrl(selected)}
                alt={product.name}
                onError={useImageFallback}
                className="max-h-[82vh] max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => onPreviewChange(false)}
                className="absolute right-3 top-3 rounded-lg border border-white/15 bg-zinc-950/90 p-2"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
