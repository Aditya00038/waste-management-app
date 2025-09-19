"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Video, Image as ImageIcon, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (dataUrl: string, type: 'image' | 'video') => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Initialize the camera
  useEffect(() => {
    if (isPreviewing) return; // Don't reinitialize if previewing

    const startCamera = async () => {
      try {
        if (videoRef.current) {
          // Stop any existing tracks
          if (videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }

          const constraints = {
            video: {
              facingMode: cameraFacingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: mode === 'video'
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        setError(err.message || "Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [cameraFacingMode, isPreviewing, mode]);

  const switchCamera = () => {
    setCameraFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);
        setIsPreviewing(true);
      }
    }
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      chunks.current = [];
      const stream = videoRef.current.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setPreviewUrl(videoUrl);
        setIsPreviewing(true);

        // Convert blob to data URL for the onCapture callback
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPreviewUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const confirmCapture = () => {
    if (previewUrl) {
      onCapture(previewUrl, mode === 'photo' ? 'image' : 'video');
    }
  };

  const resetCapture = () => {
    setIsPreviewing(false);
    setPreviewUrl(null);
  };

  if (hasPermission === false) {
    return (
      <Card className="p-6 text-center">
        <div className="mb-4 text-red-500">
          {error || "Camera access denied. Please grant camera permissions and try again."}
        </div>
        <Button onClick={onCancel}>Cancel</Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col items-center">
      <div className="relative w-full h-64 md:h-96 bg-black rounded-md overflow-hidden mb-4">
        {isPreviewing ? (
          mode === 'photo' ? (
            <img 
              src={previewUrl || ''} 
              alt="Captured" 
              className="w-full h-full object-contain" 
            />
          ) : (
            <video 
              src={previewUrl || ''} 
              controls 
              className="w-full h-full" 
            />
          )
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={cn(
              "w-full h-full object-cover",
              cameraFacingMode === 'user' && "scale-x-[-1]"
            )} 
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center w-full">
        {!isPreviewing && (
          <>
            <div className="flex gap-2 justify-center mb-2 w-full">
              <Button 
                variant={mode === 'photo' ? 'default' : 'outline'} 
                onClick={() => setMode('photo')}
                size="sm"
              >
                <Camera className="mr-1 h-4 w-4" />
                Photo
              </Button>
              <Button 
                variant={mode === 'video' ? 'default' : 'outline'} 
                onClick={() => setMode('video')}
                size="sm"
              >
                <Video className="mr-1 h-4 w-4" />
                Video
              </Button>
              <Button
                variant="outline"
                onClick={switchCamera}
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {mode === 'photo' ? (
              <Button onClick={takePicture}>
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            ) : (
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
              >
                <Video className="mr-2 h-4 w-4" />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            )}
          </>
        )}

        {isPreviewing && (
          <>
            <Button variant="default" onClick={confirmCapture}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Use {mode === 'photo' ? 'Photo' : 'Video'}
            </Button>
            <Button variant="secondary" onClick={resetCapture}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
          </>
        )}
        
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </Card>
  );
}
