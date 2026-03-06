import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRScanner } from '@/components/qr/QRScanner';
import { useAuthStore } from '@/stores/authStore';
import { parseQRCodeData } from '@/lib/utils';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [employeeCode, setEmployeeCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner] = useState(true);

  const handleQRScan = async (data: string) => {
    setError(null);
    
    // Parse QR code data
    const parsedData = parseQRCodeData(data);
    
    if (parsedData && parsedData.code) {
      setEmployeeCode(parsedData.code);
      await handleLogin(parsedData.code);
    } else {
      // If QR code doesn't contain structured data, try using the raw data as code
      setEmployeeCode(data);
      await handleLogin(data);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      setError('กรุณากรอกรหัสพนักงาน');
      return;
    }
    await handleLogin(employeeCode);
  };

  const handleLogin = async (code: string) => {
    setIsLoading(true);
    setError(null);

    const success = await login(code);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('รหัสพนักงานไม่ถูกต้องหรือไม่มีสิทธิ์เข้าใช้งาน');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TOOLING MANAGEMENT</h1>
          <p className="text-slate-500">ระบบจัดการเครื่องมือ</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              สแกน QR Code หรือกรอกรหัสพนักงาน
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* QR Scanner */}
            {showQRScanner && (
              <div className="space-y-2">
                <Label className="text-center block">สแกน QR Code</Label>
                <QRScanner 
                  onScan={handleQRScan}
                  width={280}
                  height={220}
                />
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">หรือ</span>
              </div>
            </div>

            {/* Manual Input Form */}
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCode">รหัสพนักงาน</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="employeeCode"
                    type="text"
                    placeholder="เช่น EMP001"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-pulse" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    เข้าสู่ระบบ
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center text-sm">
              <span className="text-slate-500">ยังไม่มีบัญชี? </span>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => navigate('/register')}
              >
                ลงทะเบียนที่นี่
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          © 2025 TOOLING MANAGEMENT SYSTEM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
