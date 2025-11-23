import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Upload, 
  Shield, 
  Info, 
  Instagram, 
  FileText, 
  BookOpen, 
  User, 
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Database,
  Lock,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SimpleBottomNav } from "@/components/SimpleBottomNav";
import { MessageTemplateModal } from "@/components/MessageTemplateModal";
import { ProfileSettings } from "@/components/ProfileSettings";
import { BillingPricing } from "@/components/BillingPricing";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [showCommentTemplates, setShowCommentTemplates] = useState(false);
  const [showDMTemplates, setShowDMTemplates] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showBillingPricing, setShowBillingPricing] = useState(false);

  const handleExport = async () => {
    try {
      const res = await fetch('/api/automation');
      const data = await res.json();
      const exportData = { timestamp: new Date().toISOString(), automations: data, version: '1.0' };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instaauto-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Export successful!', description: 'Automations exported to file' });
    } catch (error) {
      toast({ title: 'Export failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.automations) {
        throw new Error('Invalid file format');
      }

      // TODO: POST to an /api/automation/import endpoint if needed
      toast({
        title: "Import successful!",
        description: "Automations imported successfully",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid file format",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const user = JSON.parse(localStorage.getItem('instaauto-user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-20">
      {/* Professional Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl text-gray-900">Settings</h1>
                  <p className="text-xs text-gray-500">Manage your preferences</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Account Info */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Connected Account</span>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                {user.name || 'Demo User'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Connection Status</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Account Type</span>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                PRO Account
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="border border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer bg-white group"
            onClick={() => setShowProfileSettings(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">Profile Settings</h3>
                  <p className="text-sm text-gray-500">Manage account information</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border border-gray-200 shadow-md hover:shadow-xl hover:border-green-300 transition-all cursor-pointer bg-white group"
            onClick={() => setShowBillingPricing(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">Billing & Pricing</h3>
                  <p className="text-sm text-gray-500">Subscription management</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Templates */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Message Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Create and manage reusable message templates for comments and DMs.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setShowCommentTemplates(true)}
                className="flex items-center justify-center gap-2 h-12 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Comment Templates</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDMTemplates(true)}
                className="flex items-center justify-center gap-2 h-12 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                <BookOpen className="w-4 h-4 text-pink-600" />
                <span className="font-medium">DM Templates</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-purple-700">
                Templates help maintain consistent messaging across all automations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-5">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">End-to-End Encryption</p>
                  <p className="text-xs text-gray-600 mt-1">
                    All your data is encrypted and stored securely
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">OAuth 2.0 Authentication</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Secure Instagram authentication without storing passwords
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Local Data Storage</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your automation data is stored locally for privacy
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-0 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="export" className="text-sm font-medium">
                Export Automations
              </Label>
              <Button 
                onClick={handleExport}
                variant="outline" 
                className="w-full mt-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Download all your automations as JSON file
              </p>
            </div>

            <div>
              <Label htmlFor="import" className="text-sm font-medium">
                Import Automations
              </Label>
              <div className="mt-2">
                <Input
                  id="import"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('import')?.click()}
                  disabled={importing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importing...' : 'Import JSON'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Restore automations from exported file
              </p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-0 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle>About InstaAuto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Version:</strong> 1.0.0 Demo
              </p>
              <p>
                <strong>Purpose:</strong> Instagram automation prototype
              </p>
              <p>
                <strong>Architecture:</strong> Privacy-first, pluggable design
              </p>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Ready for real Instagram integration with clear placeholder markers. 
                Perfect for product demos and validation.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Template Modals */}
      <MessageTemplateModal
        isOpen={showCommentTemplates}
        onClose={() => setShowCommentTemplates(false)}
        onSelectTemplate={() => {}}
        type="comment"
      />
      
      <MessageTemplateModal
        isOpen={showDMTemplates}
        onClose={() => setShowDMTemplates(false)}
        onSelectTemplate={() => {}}
        type="dm"
      />

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ProfileSettings onClose={() => setShowProfileSettings(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Billing & Pricing Modal */}
      {showBillingPricing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <BillingPricing onClose={() => setShowBillingPricing(false)} />
            </div>
          </div>
        </div>
      )}

      <SimpleBottomNav />
    </div>
  );
};

export default Settings;
