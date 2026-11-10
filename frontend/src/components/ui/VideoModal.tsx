import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const [loading, setLoading] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 lg:px-32"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1440px] aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
          >
            {/* Loading Indicator */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-4 bg-black">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-[13px] font-mono tracking-widest uppercase">Buffering Cinematic Tour...</p>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-12 h-12 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 border border-white/10 shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Content */}
            {videoUrl.toLowerCase().endsWith('.mp4') ? (
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                autoPlay
                controls
                playsInline
                onCanPlay={() => setLoading(false)}
              />
            ) : (
              <iframe
                src={`${videoUrl.replace('/view', '/preview')}?autoplay=1&mute=0`}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoading(false)}
                title="MediSage AI Cinematic Tour"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
