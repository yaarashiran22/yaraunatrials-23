import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal = ({ isOpen, onClose, onCapture }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      console.log('Starting camera with facing mode:', facingMode);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('לא ניתן לגשת למצלמה. ודא שיש לך מצלמה ושנתת הרשאה.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `story-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[80vh] p-0 bg-black border-none">
        <div className="relative w-full h-full">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <DialogTitle className="text-white font-medium">צלם סטורי</DialogTitle>
            
            <Button
              onClick={switchCamera}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Camera Preview */}
          {error ? (
            <div className="flex items-center justify-center w-full h-full text-white text-center p-4">
              <div>
                <p className="mb-4">{error}</p>
                <Button onClick={startCamera} variant="outline">
                  נסה שוב
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Capture Button */}
          {!error && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-100 p-0"
              >
                <Camera className="w-8 h-8" />
              </Button>
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;