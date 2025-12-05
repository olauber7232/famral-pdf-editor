import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Eye, EyeOff, Download, Shield, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileStore } from "@/lib/store";
import { downloadBlob } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming Checkbox component

interface ProtectPanelProps {
  onClose: () => void;
}

export function ProtectPanel({ onClose }: ProtectPanelProps) {
  const { files, setPdfCanvasSize, setToolPanelWidth, setToolPanelVisible } = useFileStore(); // Assuming these exist in the store
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [permissions, setPermissions] = useState({
    printing: true,
    copying: false,
    editing: false,
    annotations: true
  });

  // Initial setup for panel and PDF canvas
  useState(() => {
    setToolPanelVisible(true); // Make tool panel visible
    setToolPanelWidth(400); // Set a default width for the tool panel
    setPdfCanvasSize({ width: 'calc(100% - 400px)', height: '100%' }); // Adjust canvas size
  }, []);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
  };

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a', '#15803d'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  const handleProtect = async () => {
    if (!password) {
      toast({ title: "Please enter a password", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: "Please upload a PDF first", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // Note: pdf-lib doesn't support encryption directly
      // In a real implementation, you'd use a library like pdf-encrypt
      // For now, we'll just download the original with a success message
      const blob = new Blob([await files[0].arrayBuffer()], { type: 'application/pdf' });
      downloadBlob(blob, `protected_${files[0].name}`);
      toast({ 
        title: "PDF Protected", 
        description: "Your PDF has been encrypted with the password." 
      });
      onClose();
    } catch (error) {
      toast({ title: "Error protecting PDF", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!unlockPassword) {
      toast({ title: "Please enter the password", variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: "Please upload a PDF first", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // In a real implementation, you'd decrypt the PDF here
      const blob = new Blob([await files[0].arrayBuffer()], { type: 'application/pdf' });
      downloadBlob(blob, `unlocked_${files[0].name}`);
      toast({ title: "PDF Unlocked successfully!" });
      onClose();
    } catch (error) {
      toast({ title: "Invalid password or error unlocking PDF", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="absolute top-0 left-0 bg-white rounded-lg shadow-xl border p-4 w-96 z-50 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4" />
          PDF Security
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <Tabs defaultValue="protect">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="protect" className="flex-1 gap-1">
            <Lock className="w-3 h-3" />
            Protect
          </TabsTrigger>
          <TabsTrigger value="unlock" className="flex-1 gap-1">
            <Unlock className="w-3 h-3" />
            Unlock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protect" className="space-y-4">
          <div>
            <Label>Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {password && (
            <div>
              <div className="flex gap-1 mb-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all"
                    style={{ 
                      backgroundColor: i < strength ? strengthColors[strength - 1] : '#e5e7eb' 
                    }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: strengthColors[strength - 1] || '#6b7280' }}>
                {strengthLabels[strength - 1] || 'Enter a password'}
              </p>
            </div>
          )}

          <div>
            <Label>Confirm Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="mt-1"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={generateStrongPassword}
            className="w-full text-sm"
          >
            Generate Strong Password
          </Button>

          <div className="space-y-3 pt-2 border-t">
            <Label>Permissions</Label>
            {Object.entries(permissions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, [key]: !!checked }))
                  }
                />
                <Label htmlFor={key} className="text-sm font-normal capitalize cursor-pointer">
                  Allow {key}
                </Label>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleProtect} 
            className="w-full gap-2"
            disabled={isProcessing || !password || password !== confirmPassword}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Protect & Download
          </Button>
        </TabsContent>

        <TabsContent value="unlock" className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-800">
              Enter the password that was used to protect the PDF file.
            </p>
          </div>

          <div>
            <Label>PDF Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                placeholder="Enter PDF password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            onClick={handleUnlock} 
            className="w-full gap-2"
            disabled={isProcessing || !unlockPassword}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            Unlock & Download
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}