import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  width?: number;
  height?: number;
}

export function QRScanner({ onScan, onError, width = 300, height = 250 }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      if (!containerRef.current) return;

      const scannerId = 'qr-scanner-' + Date.now();
      containerRef.current.id = scannerId;

      scannerRef.current = new Html5Qrcode(scannerId);

      const cameras = await Html5Qrcode.getCameras();
      
      if (cameras && cameras.length > 0) {
        // Use back camera if available
        const camera = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];
        
        await scannerRef.current.start(
          camera.id,
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanning();
          },
          () => {
            // Ignore scan errors (no QR code found)
          }
        );
        
        setIsScanning(true);
      } else {
        setHasCamera(false);
        setError('ไม่พบกล้องในอุปกรณ์ของคุณ');
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาติกล้อง');
      setHasCamera(false);
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  const toggleScanning = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Scanner Container */}
          <div 
            ref={containerRef}
            className="relative mx-auto overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
            style={{ width, height: isScanning ? height : 120 }}
          >
            {!isScanning && (
              <div className="flex h-full flex-col items-center justify-center space-y-2">
                <Camera className="h-10 w-10 text-slate-400" />
                <p className="text-sm text-slate-500">กดปุ่มเพื่อเริ่มสแกน QR Code</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Control Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant={isScanning ? "destructive" : "default"}
              onClick={toggleScanning}
              className="min-w-[140px]"
            >
              {isScanning ? (
                <>
                  <CameraOff className="mr-2 h-4 w-4" />
                  หยุดสแกน
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  เริ่มสแกน
                </>
              )}
            </Button>
          </div>

          {/* Camera Status */}
          {!hasCamera && (
            <div className="text-center text-sm text-slate-500">
              <RefreshCw className="mx-auto mb-2 h-4 w-4 animate-spin" />
              <p>หรือกรอกข้อมูลด้วยตนเอง</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
