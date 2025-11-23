import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Shield, Zap, Settings, FileText, Lock, Trash2, ArrowRight, Sparkles, Users, TrendingUp, MessageCircle, Bot } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Use real Instagram OAuth flow
      const response = await fetch('/api/auth/instagram');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Instagram OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get Instagram auth URL');
      }
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast({
        title: "Connection failed",
        description: "Please try again or check your backend server",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Professional Header - Consistent with other pages */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-2xl text-gray-900">InstaAuto</span>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-2 py-0.5 text-xs font-semibold">
                  PRO
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Automate Your Instagram Growth
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Instagram Automation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">
              Made Simple & Powerful
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Automate comments on Reels and DMs for Stories with smart AI-powered responses. 
            Connect your real Instagram account and watch your engagement soar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={handleConnect}
              disabled={connecting}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all btn-press"
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Instagram className="w-5 h-5 mr-2" />
                  Connect Instagram
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/manual-token')}
              className="flex-1 border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-xl btn-press"
            >
              Use Manual Token
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats Section with animations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">10K+</p>
              <p className="text-sm text-gray-500 mt-1">Active Users</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 number-transition">1M+</p>
              <p className="text-sm text-gray-500 mt-1">Messages Sent</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 number-transition">94%</p>
              <p className="text-sm text-gray-500 mt-1">Success Rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up" style={{animationDelay: '0.3s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 number-transition">24/7</p>
              <p className="text-sm text-gray-500 mt-1">Automation</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">Everything you need to automate your Instagram growth</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white group hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Real Instagram Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect your real Instagram account securely with OAuth 2.0 to manage and automate your content.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white group hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set up intelligent auto-comments for Reels and personalized DMs for Stories with trigger words.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white group hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Follow detection, CTA buttons, custom templates, and detailed analytics for maximum engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>

      {/* Footer - Consistent with other pages */}
      <footer className="mt-20 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-8 text-sm">
              <Link 
                to="/privacy" 
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Terms & Conditions
              </Link>
              <Link 
                to="/data-deletion" 
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Data Deletion
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center max-w-2xl">
              By using InstaAuto, you agree to our Terms of Service and Privacy Policy.
              We comply with Instagram's Platform Policy and GDPR/CCPA regulations.
            </p>
            <p className="text-xs text-gray-400">
              © 2024 InstaAuto. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
