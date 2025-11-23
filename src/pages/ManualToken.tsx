import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Key, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const ManualToken = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualConnect = async () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Instagram access token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Set the token in the API service
      api.setToken(token);
      
      // Test the token by fetching reels
      const reelsData = await api.getReels();
      
      // Store token and create mock user (token is already stored by api.setToken)
      const mockUser = {
        id: 'manual-user',
        name: 'Instagram User',
        username: 'instagram_user',
        accountType: 'PERSONAL',
        mediaCount: reelsData.length || 0,
        followersCount: 1500,
        followsCount: 800
      };
      localStorage.setItem('instaauto-user', JSON.stringify(mockUser));

      toast({
        title: "Connected Successfully!",
        description: `Found ${reelsData.length} reels in your account`,
      });

      navigate('/dashboard');

    } catch (error) {
      console.error('Manual token connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Invalid Instagram token',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-card rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 bg-gradient-instagram rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Manual Instagram Connection</h1>
              <p className="text-sm text-muted-foreground">Use your existing Instagram token</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Instagram Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your Instagram access token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 text-sm mb-2">How to get your token:</h3>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to Instagram Developer Dashboard</li>
                <li>Create a Basic Display app</li>
                <li>Generate a User Access Token</li>
                <li>Copy and paste it here</li>
              </ol>
            </div>

            <Button 
              onClick={handleManualConnect}
              disabled={loading || !token.trim()}
              className="w-full bg-gradient-instagram text-white"
            >
              {loading ? "Connecting..." : "Connect with Token"}
            </Button>

            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to OAuth
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualToken;
