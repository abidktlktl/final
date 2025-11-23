import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Instagram, LogOut, TrendingUp, Users, Eye, MessageCircle, Crown, CreditCard, User, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SimpleBottomNav } from "@/components/SimpleBottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileSettings } from "@/components/ProfileSettings";
import { BillingPricing } from "@/components/BillingPricing";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalReach: number;
    totalImpressions: number;
    totalEngagement: number;
    newFollowers: number;
    automationSuccessRate: number;
  };
  dailyStats: Array<{
    date: string;
    reach: number;
    impressions: number;
    engagement: number;
    newFollowers: number;
  }>;
  topAutomations: Array<{
    id: string;
    name: string;
    engagement: number;
    successRate: number;
  }>;
  followerGrowth: Array<{
    date: string;
    followers: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [user, setUser] = useState<{name: string; email?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showBillingPricing, setShowBillingPricing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('pro');

  useEffect(() => {
    const token = localStorage.getItem('instaauto-token');
    const userData = localStorage.getItem('instaauto-user');
    
    if (!token) {
      navigate('/');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/summary');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('instaauto-token');
    localStorage.removeItem('instaauto-user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-instagram rounded-xl flex items-center justify-center mx-auto mb-4">
            <Instagram className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-instagram rounded-xl flex items-center justify-center mx-auto mb-4">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-2xl text-gray-900">Analytics</h1>
                  <p className="text-xs text-gray-500">Track your performance</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBillingPricing(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-instagram text-white text-sm">
                    {user?.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.name || 'Demo User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'demo@example.com'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBillingPricing(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing & Pricing</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-card rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="text-xl font-bold">{analytics.summary.totalReach.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-xl font-bold">{analytics.summary.totalImpressions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-xl font-bold">{analytics.summary.totalEngagement.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-100">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Followers</p>
                  <p className="text-xl font-bold">{analytics.summary.newFollowers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold">{analytics.summary.automationSuccessRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Follower Growth Chart */}
          <Card className="border-0 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.followerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Followers']}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="followers" 
                      stroke="#E1306C" 
                      strokeWidth={2}
                      dot={{ fill: '#E1306C' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Performance Chart */}
          <Card className="border-0 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Daily Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const labelMap: Record<string, string> = {
                          reach: 'Reach',
                          impressions: 'Impressions',
                          engagement: 'Engagement',
                          newFollowers: 'New Followers'
                        };
                        return [value, labelMap[name as string] || name];
                      }}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Bar dataKey="reach" fill="#0088FE" />
                    <Bar dataKey="impressions" fill="#00C49F" />
                    <Bar dataKey="engagement" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Automations Chart */}
          <Card className="border-0 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Top Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analytics.topAutomations}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={90}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'engagement') return [value, 'Engagement'];
                        if (name === 'successRate') return [`${value}%`, 'Success Rate'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="engagement" fill="#8884D8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate Distribution */}
          <Card className="border-0 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Success Rate Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.topAutomations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, successRate }) => `${name}: ${successRate}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="successRate"
                    >
                      {analytics.topAutomations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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

export default Analytics;
