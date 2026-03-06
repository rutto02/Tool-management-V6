import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QRGeneratorProps {
  value: string;
  size?: number;
  includeText?: boolean;
  downloadEnabled?: boolean;
  printEnabled?: boolean;
}

export function QRGenerator({ 
  value, 
  size = 150, 
  includeText = true,
  downloadEnabled = true,
  printEnabled = true
}: QRGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (value) {
      generateQRCode();
    }
  }, [value, size]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setImageUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `qr-code-${value}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!imageUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
                border: 1px solid #ccc;
              }
              .qr-code {
                max-width: 100%;
                height: auto;
              }
              .qr-text {
                margin-top: 10px;
                font-size: 14px;
                font-weight: bold;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${imageUrl}" class="qr-code" />
              ${includeText ? `<div class="qr-text">${value}</div>` : ''}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!value) {
    return (
      <Card className="w-fit">
        <CardContent className="p-4">
          <div 
            className="flex items-center justify-center bg-slate-100 rounded-lg"
            style={{ width: size, height: size }}
          >
            <p className="text-xs text-slate-400">ไม่มีข้อมูล QR Code</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-fit">
      <CardContent className="p-4 space-y-3">
        {/* QR Code Image */}
        <div className="flex flex-col items-center space-y-2">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`QR: ${value}`}
              className="rounded-lg border border-slate-200"
              style={{ width: size, height: size }}
            />
          ) : (
            <div 
              className="flex items-center justify-center bg-slate-100 rounded-lg animate-pulse"
              style={{ width: size, height: size }}
            >
              <p className="text-xs text-slate-400">กำลังสร้าง...</p>
            </div>
          )}
          {includeText && (
            <p className="text-xs font-mono text-slate-600 break-all max-w-[150px] text-center">
              {value}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {(downloadEnabled || printEnabled) && (
          <div className="flex justify-center gap-2">
            {downloadEnabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="mr-1 h-3 w-3" />
                ดาวน์โหลด
              </Button>
            )}
            {printEnabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="mr-1 h-3 w-3" />
                พิมพ์
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
