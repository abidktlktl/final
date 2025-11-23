import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleInstagramCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || 'Authentication failed');
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('🔐 Processing Instagram callback with code:', code.substring(0, 10) + '...');

        // Send code to backend to exchange for access token
        const response = await fetch('/api/auth/instagram/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Authentication failed');
        }

        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('insta-auto-token', data.token);
        localStorage.setItem('insta-auto-user', JSON.stringify(data.user));

        setStatus('success');
        setMessage('Successfully connected to Instagram!');

        toast({
          title: "Instagram Connected",
          description: "Your Instagram account has been successfully connected",
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Instagram callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : 'Failed to connect Instagram account',
          variant: "destructive",
        });
      }
    };

    handleInstagramCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-card rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-instagram rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Connecting Instagram...'}
            {status === 'success' && 'Connected Successfully!'}
            {status === 'error' && 'Connection Failed'}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {status === 'loading' && 'Please wait while we connect your Instagram account...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-gradient-instagram text-white"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
