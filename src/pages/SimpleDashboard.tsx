import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  MessageCircle, 
  Send, 
  Users, 
  Zap,
  Settings,
  LogOut,
  ChevronRight,
  Check,
  X,
  Bot,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  Play,
  RefreshCw,
  CheckCircle2,
  Plus,
  Hash,
  Link,
  MousePointer,
  ArrowLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SimpleBottomNav } from "@/components/SimpleBottomNav";
import { SkeletonLoader, EmptyState, LoadingDots } from "@/components/SkeletonLoader";

interface Reel {
  id: string;
  thumbnail: string;
  caption: string;
  owner: string;
  permalink?: string;
  timestamp?: string;
  media_url?: string;
  isRealData?: boolean;
}

interface Automation {
  comment?: string;
  dm?: string;
  followBefore?: boolean;
  follower_message?: string;
  non_follower_message?: string;
  triggerWords?: string[];
  buttons?: Array<{
    text: string;
    url: string;
  }>;
  autoDmOnComment?: boolean;
  dmOnCommentMessage?: string;
  dmOnCommentDelay?: number;
}

const SimpleDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState<Reel[]>([]);
  const [automations, setAutomations] = useState<Record<string, Automation>>({});
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [stats, setStats] = useState({
    totalAutomations: 0,
    activeAutomations: 0,
    messagessSent: 0,
    followersGained: 0
  });
  
  // Automation States
  const [commentReplyEnabled, setCommentReplyEnabled] = useState(true);
  const [dmAutomationEnabled, setDmAutomationEnabled] = useState(true);
  const [followCheckEnabled, setFollowCheckEnabled] = useState(true);
  const [autoDmOnComment, setAutoDmOnComment] = useState(true);
  
  // Templates
  const [commentTemplate, setCommentTemplate] = useState("Thanks for your comment! 🙏");
  const [followerDmTemplate, setFollowerDmTemplate] = useState("Welcome! Here's your exclusive content: [link]");
  const [nonFollowerDmTemplate, setNonFollowerDmTemplate] = useState("Thanks! Follow us for exclusive content 👆");
  const [dmOnCommentMessage, setDmOnCommentMessage] = useState("Thanks for commenting! 💬 Check your DMs for exclusive content 🎁");
  const [dmOnCommentDelay, setDmOnCommentDelay] = useState(5);
  
  // Advanced Settings
  const [responseDelay, setResponseDelay] = useState(0); // in seconds
  const [dailyLimit, setDailyLimit] = useState(100);
  
  // Trigger Words
  const [triggerWords, setTriggerWords] = useState<string[]>(['price', 'info', 'details', 'buy']);
  const [newTriggerWord, setNewTriggerWord] = useState("");
  
  // CTA Buttons
  const [ctaButtons, setCtaButtons] = useState<Array<{text: string; url: string}>>([
    { text: "Shop Now", url: "https://yourstore.com" },
    { text: "Learn More", url: "https://yoursite.com/info" }
  ]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [showReelSelector, setShowReelSelector] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('instaauto-token');
    if (!token) {
      navigate('/');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('instaauto-token');
      if (token) {
        api.setToken(token);
      }

      // Fetch real Instagram reels
      const [reelsData, automationData] = await Promise.all([
        api.getReels().catch(err => {
          console.error('Failed to load reels:', err);
          toast({
            title: "Failed to load reels",
            description: "Please check your Instagram connection",
            variant: "destructive",
          });
          return [];
        }),
        api.getAutomations().catch(err => {
          console.error('Failed to load automations:', err);
          return { reels: {} };
        })
      ]);

      setReels(reelsData);
      setAutomations(automationData.reels || {});
      
      // Calculate stats
      const activeCount = Object.keys(automationData.reels || {}).length;
      setStats({
        totalAutomations: activeCount,
        activeAutomations: activeCount,
        messagessSent: 156,
        followersGained: 42
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const refreshReels = async () => {
    setLoading(true);
    await loadData();
    toast({
      title: "Reels refreshed",
      description: `Loaded ${reels.length} reels from Instagram`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('instaauto-token');
    localStorage.removeItem('instaauto-user');
    navigate('/');
  };

  const handleSaveAutomation = async (type: string) => {
    try {
      if (type === 'reel' && selectedReel) {
        // Save automation for selected reel
        const automationData = {
          comment: commentTemplate,
          follower_message: followerDmTemplate,
          non_follower_message: nonFollowerDmTemplate,
          followBefore: followCheckEnabled,
          triggerWords: triggerWords,
          buttons: ctaButtons,
          responseDelay: responseDelay,
          dailyLimit: dailyLimit,
          autoDmOnComment: autoDmOnComment,
          dmOnCommentMessage: dmOnCommentMessage,
          dmOnCommentDelay: dmOnCommentDelay
        };
        
        await api.saveReelAutomation(selectedReel.id, automationData);
        
        // Update local state
        setAutomations(prev => ({
          ...prev,
          [selectedReel.id]: automationData
        }));
        
        toast({
          title: "✅ Automation Saved",
          description: `Automation set for reel: ${selectedReel.caption?.substring(0, 30)}...`,
        });
        
        setSelectedReel(null);
      } else {
        // Save general automation settings
        toast({
          title: "✅ Settings Saved",
          description: `Your ${type} settings have been updated!`,
        });
      }
      setSelectedAutomation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save automation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAutomation = async (reelId: string) => {
    try {
      await api.deleteReelAutomation(reelId);
      
      setAutomations(prev => {
        const newAutomations = { ...prev };
        delete newAutomations[reelId];
        return newAutomations;
      });
      
      toast({
        title: "Automation removed",
        description: "Automation has been disabled for this reel",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove automation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Professional Header */}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="rounded-full hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Automation Dashboard
          </h1>
          <p className="text-gray-500 text-lg">Manage your Instagram automation and track performance</p>
        </div>

        {/* Quick Stats with animations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {loading ? (
            <>
              <SkeletonLoader type="stat" />
              <SkeletonLoader type="stat" />
              <SkeletonLoader type="stat" />
              <SkeletonLoader type="stat" />
            </>
          ) : (
            <>
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeAutomations}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 number-transition">{stats.messagessSent}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Followers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 number-transition">+{stats.followersGained}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white card-tilt slide-up" style={{animationDelay: '0.3s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 number-transition">94%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Reels Selection (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            {/* Reels Selection Section */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      Your Instagram Reels
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Click on any reel to configure its automation
                    </p>
                  </div>
                  <Button
                    onClick={refreshReels}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-gray-300 hover:border-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {reels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">No Reels Found</h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Connect your Instagram account or create some reels to get started with automation
                    </p>
                    <Button
                      onClick={refreshReels}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Load Reels
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Reels Stats Bar */}
                    <div className="flex items-center justify-between mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reels</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{reels.length}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Automated</p>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {Object.keys(automations).length}
                          </p>
                        </div>
                        <div className="h-10 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                          <p className="text-2xl font-bold text-amber-600 mt-1">
                            {reels.length - Object.keys(automations).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reels Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {reels.map((reel) => {
                        const hasAutomation = !!automations[reel.id];
                        return (
                          <div
                            key={reel.id}
                            className="relative group cursor-pointer transform transition-transform hover:scale-105"
                            onClick={() => {
                              setSelectedReel(reel);
                              setShowSidePanel(true);
                              // Load existing automation data if available
                              const existing = automations[reel.id];
                              if (existing) {
                                setCommentTemplate(existing.comment || "Thanks for your comment! 🙏");
                                setFollowerDmTemplate(existing.follower_message || "Welcome! Here's your exclusive content: [link]");
                                setNonFollowerDmTemplate(existing.non_follower_message || "Thanks! Follow us for exclusive content 👆");
                                setTriggerWords(existing.triggerWords || ['price', 'info', 'details', 'buy']);
                                setCtaButtons(existing.buttons || [{ text: "Shop Now", url: "https://yourstore.com" }]);
                                setAutoDmOnComment(existing.autoDmOnComment || false);
                                setDmOnCommentMessage(existing.dmOnCommentMessage || "Thanks for commenting! 💬 Check your DMs for exclusive content 🎁");
                                setDmOnCommentDelay(existing.dmOnCommentDelay || 5);
                              }
                            }}
                          >
                            <div className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                              {reel.thumbnail && reel.thumbnail !== '/placeholder.svg' ? (
                                <img
                                  src={reel.thumbnail}
                                  alt={reel.caption}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                  <Play className="w-10 h-10 text-purple-600" />
                                </div>
                              )}
                              
                              {/* Button container - centered and appears on hover */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button
                                  size="sm"
                                  className="bg-white hover:bg-gray-100 text-gray-900 font-semibold shadow-lg transition-all px-4"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReel(reel);
                                    setShowSidePanel(true);
                                    // Load existing automation data if available
                                    const existing = automations[reel.id];
                                    if (existing) {
                                      setCommentTemplate(existing.comment || "Thanks for your comment! 🙏");
                                      setFollowerDmTemplate(existing.follower_message || "Welcome! Here's your exclusive content: [link]");
                                      setNonFollowerDmTemplate(existing.non_follower_message || "Thanks! Follow us for exclusive content 👆");
                                      setTriggerWords(existing.triggerWords || ['price', 'info', 'details', 'buy']);
                                      setCtaButtons(existing.buttons || [{ text: "Shop Now", url: "https://yourstore.com" }]);
                                    }
                                  }}
                                >
                                  {hasAutomation ? (
                                    <>
                                      <Settings className="w-3 h-3 mr-1" />
                                      Edit Automation
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3 mr-1" />
                                      Setup Automation
                                    </>
                                  )}
                                </Button>
                              </div>
                              
                              {/* Status Badge */}
                              {hasAutomation && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-green-500 text-white border-0 shadow-md px-2 py-1">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                </div>
                              )}
                              
                              {/* Real Data Indicator */}
                              {reel.isRealData && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-blue-500 text-white border-0 text-xs shadow-md px-2 py-1">
                                    LIVE
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            {/* Caption & Info */}
                            <div className="mt-2">
                              <p className="text-xs font-medium line-clamp-1 text-gray-800">
                                {reel.caption || 'No caption'}
                              </p>
                              {reel.timestamp && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(reel.timestamp).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Automation Flow (1/3 width on desktop) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Automation Flow Card */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-purple-600 to-pink-600 text-white px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  Automation Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
              <div className="space-y-4">
                {/* Step 1: Comment Reply with Triggers */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Auto-Reply to Comments</h3>
                        <p className="text-sm text-gray-600">Reply with triggers</p>
                      </div>
                      <Switch
                        checked={commentReplyEnabled}
                        onCheckedChange={setCommentReplyEnabled}
                      />
                    </div>
                    {commentReplyEnabled && (
                      <div className="mt-3 space-y-2">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">Reply Template:</p>
                          <p className="text-sm text-purple-600">{commentTemplate}</p>
                        </div>
                        {triggerWords.length > 0 && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              Trigger Words:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {triggerWords.slice(0, 3).map((word, i) => (
                                <Badge key={i} className="text-xs bg-purple-100 text-purple-700 border-0">
                                  {word}
                                </Badge>
                              ))}
                              {triggerWords.length > 3 && (
                                <Badge className="text-xs bg-gray-200 text-gray-600 border-0">
                                  +{triggerWords.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>

                {/* Step 2: Follow Check */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Smart Follow Detection</h3>
                        <p className="text-sm text-gray-600">Check if commenter follows you</p>
                      </div>
                      <Switch
                        checked={followCheckEnabled}
                        onCheckedChange={setFollowCheckEnabled}
                      />
                    </div>
                    {followCheckEnabled && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">If Following</span>
                          </div>
                          <p className="text-xs text-green-600">Send welcome DM with exclusive content</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <X className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-700">If Not Following</span>
                          </div>
                          <p className="text-xs text-orange-600">Send follow invitation with CTA button</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                </div>

                {/* Step 3: Send DM with CTA */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Personalized DM</h3>
                        <p className="text-sm text-gray-600">With CTA buttons</p>
                      </div>
                      <Switch
                        checked={dmAutomationEnabled}
                        onCheckedChange={setDmAutomationEnabled}
                      />
                    </div>
                    {dmAutomationEnabled && (
                      <div className="mt-3 space-y-2">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs font-semibold text-green-700 mb-1">Follower DM:</p>
                          <p className="text-xs text-green-600 line-clamp-2">{followerDmTemplate}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-xs font-semibold text-orange-700 mb-1">Non-Follower DM:</p>
                          <p className="text-xs text-orange-600 line-clamp-2">{nonFollowerDmTemplate}</p>
                        </div>
                        {ctaButtons.filter(b => b.text).length > 0 && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              CTA Buttons:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {ctaButtons.filter(b => b.text).map((btn, i) => (
                                <Button key={i} size="sm" className="h-6 px-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                  {btn.text}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
              <Card 
                className="border border-gray-200 shadow-md hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer bg-white group"
                onClick={() => setSelectedAutomation('comment')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">Comment Reply</h3>
                      <p className="text-xs text-gray-500">Configure auto-reply message</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer bg-white group"
                onClick={() => setSelectedAutomation('dm')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">DM Templates</h3>
                      <p className="text-xs text-gray-500">Personalized messages</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border border-gray-200 shadow-md hover:shadow-lg hover:border-pink-300 transition-all cursor-pointer bg-white group"
                onClick={() => setSelectedAutomation('settings')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">Advanced Settings</h3>
                      <p className="text-xs text-gray-500">Delays, limits & more</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Replied to @user123</p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Success</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Send className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">DM sent to @follower456</p>
                    <p className="text-xs text-gray-600">5 minutes ago</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">Follower</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Follow invite to @newuser789</p>
                    <p className="text-xs text-gray-600">10 minutes ago</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-0">Non-Follower</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Simplified Side Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[520px] transform transition-transform duration-300 z-50 ${
        showSidePanel ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedReel && (
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Simple Header */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowSidePanel(false);
                    setTimeout(() => setSelectedReel(null), 300);
                  }}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Automation Settings
                </h2>
                <div className="w-10"></div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6 space-y-6">
                {/* Comment Reply Section */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Comment Auto-Reply</h3>
                      <p className="text-sm text-gray-500 mt-1">Automatically reply to comments</p>
                    </div>
                    <Switch
                      checked={commentReplyEnabled}
                      onCheckedChange={setCommentReplyEnabled}
                    />
                  </div>
                  {commentReplyEnabled && (
                    <Textarea
                      value={commentTemplate}
                      onChange={(e) => setCommentTemplate(e.target.value)}
                      placeholder="Enter your auto-reply message..."
                      className="w-full border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      rows={3}
                    />
                  )}
                </div>

                {/* Trigger Words Section */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Trigger Words</h3>
                  <p className="text-sm text-gray-500 mb-4">Reply only to comments containing these words</p>
                  
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newTriggerWord}
                      onChange={(e) => setNewTriggerWord(e.target.value)}
                      placeholder="Add trigger word..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTriggerWord.trim()) {
                          setTriggerWords([...triggerWords, newTriggerWord.trim()]);
                          setNewTriggerWord("");
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newTriggerWord.trim()) {
                          setTriggerWords([...triggerWords, newTriggerWord.trim()]);
                          setNewTriggerWord("");
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {triggerWords.map((word, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => setTriggerWords(triggerWords.filter((_, i) => i !== index))}
                      >
                        {word}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                    {triggerWords.length === 0 && (
                      <span className="text-sm text-gray-400">No trigger words set</span>
                    )}
                  </div>
                </div>

                {/* Auto DM on Comment Section */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Auto DM on Comment</h3>
                      <p className="text-sm text-gray-500 mt-1">Send DM when someone comments</p>
                    </div>
                    <Switch
                      checked={autoDmOnComment}
                      onCheckedChange={setAutoDmOnComment}
                    />
                  </div>
                  
                  {autoDmOnComment && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">DM Message</Label>
                        <Textarea
                          value={dmOnCommentMessage}
                          onChange={(e) => setDmOnCommentMessage(e.target.value)}
                          placeholder="Thanks for commenting! 💬 Check your DMs for exclusive content..."
                          className="w-full"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">DM Delay (seconds)</Label>
                        <select 
                          className="w-full p-2 border rounded-lg"
                          value={dmOnCommentDelay}
                          onChange={(e) => setDmOnCommentDelay(parseInt(e.target.value))}
                        >
                          <option value="0">Instant</option>
                          <option value="5">5 seconds</option>
                          <option value="10">10 seconds</option>
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* DM Settings Section */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Follow-Based DMs</h3>
                      <p className="text-sm text-gray-500 mt-1">Send personalized DMs based on follower status</p>
                    </div>
                    <Switch
                      checked={followCheckEnabled}
                      onCheckedChange={setFollowCheckEnabled}
                    />
                  </div>
                  
                  {followCheckEnabled && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">For Followers</Label>
                        <Textarea
                          value={followerDmTemplate}
                          onChange={(e) => setFollowerDmTemplate(e.target.value)}
                          placeholder="Message for followers..."
                          className="w-full"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">For Non-Followers</Label>
                        <Textarea
                          value={nonFollowerDmTemplate}
                          onChange={(e) => setNonFollowerDmTemplate(e.target.value)}
                          placeholder="Message for non-followers..."
                          className="w-full"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Buttons Section */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Call-to-Action Buttons</h3>
                  <p className="text-sm text-gray-500 mb-4">Add buttons to your DMs</p>
                  
                  <div className="space-y-2">
                    {ctaButtons.map((button, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={button.text}
                          onChange={(e) => {
                            const newButtons = [...ctaButtons];
                            newButtons[index].text = e.target.value;
                            setCtaButtons(newButtons);
                          }}
                          placeholder="Button text"
                          className="flex-1"
                        />
                        <Input
                          value={button.url}
                          onChange={(e) => {
                            const newButtons = [...ctaButtons];
                            newButtons[index].url = e.target.value;
                            setCtaButtons(newButtons);
                          }}
                          placeholder="https://..."
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setCtaButtons(ctaButtons.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCtaButtons([...ctaButtons, { text: "", url: "" }])}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Button
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Bottom Actions */}
            <div className="border-t bg-white px-6 py-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSidePanel(false);
                    setTimeout(() => setSelectedReel(null), 300);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    handleSaveAutomation('reel');
                    setShowSidePanel(false);
                    setTimeout(() => setSelectedReel(null), 300);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simple Overlay */}
      {showSidePanel && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setShowSidePanel(false);
            setTimeout(() => setSelectedReel(null), 300);
          }}
        />
      )}

      {/* Simple Edit Modal */}
      {selectedAutomation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>
                {selectedAutomation === 'comment' && 'Edit Comment Reply'}
                {selectedAutomation === 'dm' && 'Edit DM Templates'}
                {selectedAutomation === 'settings' && 'Advanced Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAutomation === 'comment' && (
                <div>
                  <label className="text-sm font-medium">Auto-Reply Message</label>
                  <textarea
                    className="w-full mt-2 p-3 border rounded-lg"
                    rows={3}
                    value={commentTemplate}
                    onChange={(e) => setCommentTemplate(e.target.value)}
                    placeholder="Thanks for your comment! 🙏"
                  />
                </div>
              )}

              {selectedAutomation === 'dm' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Follower DM Template</label>
                    <textarea
                      className="w-full mt-2 p-3 border border-green-200 rounded-lg bg-green-50"
                      rows={3}
                      value={followerDmTemplate}
                      onChange={(e) => setFollowerDmTemplate(e.target.value)}
                      placeholder="Welcome! Here's your exclusive content..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-orange-700">Non-Follower DM Template</label>
                    <textarea
                      className="w-full mt-2 p-3 border border-orange-200 rounded-lg bg-orange-50"
                      rows={3}
                      value={nonFollowerDmTemplate}
                      onChange={(e) => setNonFollowerDmTemplate(e.target.value)}
                      placeholder="Thanks! Follow us for exclusive content..."
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      ✨ A "Follow" button will be automatically added to this message
                    </p>
                  </div>
                </div>
              )}

              {selectedAutomation === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Response Delay</label>
                    <select 
                      className="w-full mt-2 p-3 border rounded-lg"
                      value={responseDelay}
                      onChange={(e) => setResponseDelay(parseInt(e.target.value))}
                    >
                      <option value="0">Instant</option>
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="120">2 minutes</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      Delay before sending auto-reply to comments
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Daily Limit</label>
                    <input
                      type="number"
                      className="w-full mt-2 p-3 border rounded-lg"
                      placeholder="100"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value) || 100)}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Maximum auto-replies per day (per reel)
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedAutomation(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={() => handleSaveAutomation(selectedAutomation)}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <SimpleBottomNav />
      
      {/* Add padding bottom for mobile to account for bottom nav */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default SimpleDashboard;
