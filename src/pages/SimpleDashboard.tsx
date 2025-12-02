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
import { SkeletonLoader, LoadingDots } from "@/components/SkeletonLoader";
import { CommentDMAutomationForm } from "@/components/CommentDMAutomationForm";

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
  const [responseDelay, setResponseDelay] = useState(0);
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
  const [showBulkApplyModal, setShowBulkApplyModal] = useState(false);
  const [bulkApplyCommentReplies, setBulkApplyCommentReplies] = useState<string[]>([
    "Thanks for your comment! 🙏",
    "Appreciate the love! ❤️",
    "Thanks for stopping by! 😊"
  ]);
  const [bulkApplyNewReply, setBulkApplyNewReply] = useState("");

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

  const handleApplyToAllReels = async () => {
    if (bulkApplyCommentReplies.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one comment reply",
        variant: "destructive",
      });
      return;
    }

    try {
      const automationData = {
        comment: bulkApplyCommentReplies[0],
        commentReplies: bulkApplyCommentReplies,
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

      // Apply to all reels
      const promises = reels.map(reel =>
        api.saveReelAutomation(reel.id, automationData)
      );

      await Promise.all(promises);

      // Update local state
      const newAutomations: Record<string, Automation> = {};
      reels.forEach(reel => {
        newAutomations[reel.id] = automationData;
      });
      setAutomations(newAutomations);

      toast({
        title: "✅ Automation Applied",
        description: `Automation successfully applied to all ${reels.length} reels!`,
      });

      setShowBulkApplyModal(false);
    } catch (error) {
      console.error("Error applying automation to all reels:", error);
      toast({
        title: "Error",
        description: "Failed to apply automation to all reels",
        variant: "destructive",
      });
    }
  };

  const addBulkReply = () => {
    if (bulkApplyNewReply.trim() && !bulkApplyCommentReplies.includes(bulkApplyNewReply.trim())) {
      setBulkApplyCommentReplies([...bulkApplyCommentReplies, bulkApplyNewReply.trim()]);
      setBulkApplyNewReply("");
    }
  };

  const removeBulkReply = (index: number) => {
    setBulkApplyCommentReplies(bulkApplyCommentReplies.filter((_, i) => i !== index));
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
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowBulkApplyModal(true)}
                  size="sm"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Apply to All
                </Button>
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

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white mt-8">
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
                  Setup Automation
                </h2>
                <div className="w-10"></div>
              </div>
            </div>

            {/* Automation Form */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <CommentDMAutomationForm
                reelCaption={selectedReel.caption}
                onSave={(automation) => {
                  console.log("Automation saved:", automation);
                  toast({
                    title: "✅ Automation Saved",
                    description: "Comment DM sequence configured",
                  });
                  setShowSidePanel(false);
                  setTimeout(() => setSelectedReel(null), 300);
                }}
                onCancel={() => {
                  setShowSidePanel(false);
                  setTimeout(() => setSelectedReel(null), 300);
                }}
              />
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
      
      {/* Bulk Apply Modal */}
      {showBulkApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Apply Automation to All Reels
              </CardTitle>
              <p className="text-sm text-purple-100 mt-2">
                Configure automation once and apply to all {reels.length} reels
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Comment Replies */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Comment Replies (2+ replies recommended)</Label>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-3">
                  <p className="text-sm text-purple-900">✨ One reply will be randomly selected for each comment</p>
                </div>
                <div className="flex gap-2 mb-3">
                  <textarea
                    placeholder="Enter a comment reply..."
                    value={bulkApplyNewReply}
                    onChange={(e) => setBulkApplyNewReply(e.target.value)}
                    rows={2}
                    className="flex-1 p-3 border rounded-lg text-sm"
                  />
                  <Button size="sm" onClick={addBulkReply} className="px-3 h-fit">Add</Button>
                </div>
                <div className="space-y-2">
                  {bulkApplyCommentReplies.map((reply, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-800 flex-1">{reply}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBulkReply(index)}
                        className="hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opening DM */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Opening DM Message</Label>
                <textarea
                  value={followerDmTemplate}
                  onChange={(e) => setFollowerDmTemplate(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="First message they receive after commenting..."
                />
              </div>

              {/* Trigger Type */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Trigger Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <input type="radio" id="any" defaultChecked className="w-4 h-4" />
                    <label htmlFor="any" className="text-sm cursor-pointer flex-1">Any Comment (reply to all)</label>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <input type="radio" id="keywords" className="w-4 h-4" />
                    <label htmlFor="keywords" className="text-sm cursor-pointer flex-1">Specific Keywords</label>
                  </div>
                </div>
              </div>

              {/* Main Offer */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Main Offer + Link</Label>
                <textarea
                  value={commentTemplate}
                  onChange={(e) => setCommentTemplate(e.target.value)}
                  rows={3}
                  className="w-full p-3 border rounded-lg text-sm mb-3"
                  placeholder="Your offer message..."
                />
                <input
                  type="text"
                  value={ctaButtons[0]?.text || "Get Access"}
                  onChange={(e) => setCtaButtons([{ ...ctaButtons[0], text: e.target.value }])}
                  className="w-full p-3 border rounded-lg text-sm mb-2"
                  placeholder="Button text"
                />
                <input
                  type="text"
                  value={ctaButtons[0]?.url || "https://yourlink.com"}
                  onChange={(e) => setCtaButtons([{ ...ctaButtons[0], url: e.target.value }])}
                  className="w-full p-3 border rounded-lg text-sm"
                  placeholder="Button URL"
                />
              </div>

              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">⚡ Summary:</span> This automation will be applied to all {reels.length} reels with {bulkApplyCommentReplies.length} random comment replies.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBulkApplyModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={handleApplyToAllReels}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Apply to All {reels.length} Reels
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
