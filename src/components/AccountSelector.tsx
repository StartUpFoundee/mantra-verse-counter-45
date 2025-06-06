
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  User, 
  Calendar, 
  Upload, 
  QrCode, 
  Camera,
  FileText,
  AlertCircle 
} from 'lucide-react';
import { useAccountManager } from '@/hooks/useAccountManager';
import { useQRTransfer } from '@/hooks/useQRTransfer';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

interface AccountSelectorProps {
  onCreateAccount: (slot: number) => void;
  onSelectAccount: (slot: number) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onCreateAccount,
  onSelectAccount
}) => {
  const { accounts, isLoading } = useAccountManager();
  const { importFromQR } = useQRTransfer();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'camera'>('file');
  const [qrData, setQrData] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImportAccount = () => {
    const availableSlot = accounts.find(acc => acc.isEmpty)?.slot;
    if (!availableSlot) {
      toast.error('All account slots are occupied. Please remove an account first.');
      return;
    }
    setSelectedSlot(availableSlot);
    setShowImportDialog(true);
  };

  const handleQRImport = async () => {
    if (!qrData.trim()) {
      toast.error('Please provide QR code data');
      return;
    }

    setImporting(true);
    try {
      await importFromQR(qrData, selectedSlot);
      toast.success('Account imported successfully!');
      setShowImportDialog(false);
      setQrData('');
      // Refresh the page to show the new account
      window.location.reload();
    } catch (error) {
      toast.error('Failed to import account. Please check your QR code.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // For now, we'll assume the file contains the QR data
      // In a real app, you'd use a QR code reader library
      setQrData(result);
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800">
        <div className="mb-6 text-amber-600 dark:text-amber-400 text-xl font-medium">
          Loading accounts...
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-black dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🕉️</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Mantra Verse
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose or create your spiritual identity
          </p>
        </div>

        {/* Account Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {accounts.map((accountSlot) => (
            <Card 
              key={accountSlot.slot}
              className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50 hover:shadow-lg transition-all duration-300"
            >
              {accountSlot.isEmpty ? (
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-500 dark:text-zinc-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Slot {accountSlot.slot}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Create a new account
                  </p>
                  <Button
                    onClick={() => onCreateAccount(accountSlot.slot)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    Create Account
                  </Button>
                </CardContent>
              ) : (
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg">
                        {accountSlot.account?.avatar || getInitials(accountSlot.account?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {accountSlot.account?.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        Slot {accountSlot.slot}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span className="font-mono text-xs">
                        {accountSlot.account?.id.slice(0, 20)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {format(new Date(accountSlot.account?.createdAt || ''), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onSelectAccount(accountSlot.slot)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Continue
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Import Account Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleImportAccount}
            className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border-amber-200/50 dark:border-zinc-700/50"
            disabled={!accounts.some(acc => acc.isEmpty)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Account from QR
          </Button>
          
          {!accounts.some(acc => acc.isEmpty) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All account slots are occupied
            </p>
          )}
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Account</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Import an account from another device using QR code data.
              This will use account slot {selectedSlot}.
            </div>
            
            {/* Import Method Selection */}
            <div className="flex gap-2">
              <Button
                variant={importMethod === 'file' ? 'default' : 'outline'}
                onClick={() => setImportMethod('file')}
                className="flex-1"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Paste Data
              </Button>
              <Button
                variant={importMethod === 'camera' ? 'default' : 'outline'}
                onClick={() => setImportMethod('camera')}
                className="flex-1"
                size="sm"
                disabled
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan QR
                <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
              </Button>
            </div>

            {importMethod === 'file' && (
              <div className="space-y-3">
                <Label htmlFor="qr-data">QR Code Data</Label>
                <textarea
                  id="qr-data"
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="Paste your QR code data here..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get this data by generating a QR code from your other device
                </p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.json"
            />

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleQRImport}
                disabled={importing || !qrData.trim()}
                className="flex-1"
              >
                {importing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <QrCode className="w-4 h-4 mr-2" />
                )}
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSelector;
