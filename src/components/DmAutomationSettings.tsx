import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  MessageCircle, 
  UserPlus, 
  Hash, 
  Clock, 
  Save, 
  Plus, 
  Trash2,
  Bot,
  Zap,
  MessageSquare,
  Users,
  AlertTriangle,
  Copy,
  Shuffle
} from "lucide-react";

interface KeywordResponse {
  keywords: string[];
  response: string;
}

interface DmAutomation {
  welcome_message?: {
    enabled: boolean;
    message: string;
    delay: number;
  };
  story_reply?: {
    enabled: boolean;
    message: string;
  };
  keyword_responses?: KeywordResponse[];
}

export function DmAutomationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dmAutomation, setDmAutomation] = useState<DmAutomation>({
    welcome_message: {
      enabled: false,
      message: "",
      delay: 0
    },
    story_reply: {
      enabled: false,
      message: ""
    },
    keyword_responses: []
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [keywordResponse, setKeywordResponse] = useState("");
  
  // Comment reply variants
  const [commentVariants, setCommentVariants] = useState<string[]>([
    "Thanks for your comment! 🙏",
    "Appreciate your feedback!",
    "Thanks for engaging with us!",
    "Love your comment! ✨"
  ]);
  const [newVariant, setNewVariant] = useState("");
  const [commentDelayMs, setCommentDelayMs] = useState(5000);
  const [maxRepliesPerDay, setMaxRepliesPerDay] = useState(100);
  const [useRandomVariants, setUseRandomVariants] = useState(true);

  useEffect(() => {
    loadDmAutomation();
  }, []);

  const loadDmAutomation = async () => {
    setLoading(true);
    try {
      const response = await api.getDmAutomation();
      if (response.dm_automations) {
        setDmAutomation(response.dm_automations);
      }
    } catch (error) {
      console.error("Failed to load DM automation:", error);
      toast({
        title: "Error",
        description: "Failed to load DM automation settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDmAutomation = async () => {
    setSaving(true);
    try {
      await api.saveDmAutomation(dmAutomation);
      toast({
        title: "Success",
        description: "DM automation settings saved successfully"
      });
    } catch (error) {
      console.error("Failed to save DM automation:", error);
      toast({
        title: "Error",
        description: "Failed to save DM automation settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setCurrentKeywords([...currentKeywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setCurrentKeywords(currentKeywords.filter((_, i) => i !== index));
  };

  const addKeywordResponse = () => {
    if (currentKeywords.length > 0 && keywordResponse.trim()) {
      const newResponses = [...(dmAutomation.keyword_responses || [])];
      newResponses.push({
        keywords: currentKeywords,
        response: keywordResponse.trim()
      });
      setDmAutomation({
        ...dmAutomation,
        keyword_responses: newResponses
      });
      setCurrentKeywords([]);
      setKeywordResponse("");
    }
  };

  const removeKeywordResponse = (index: number) => {
    const newResponses = dmAutomation.keyword_responses?.filter((_, i) => i !== index) || [];
    setDmAutomation({
      ...dmAutomation,
      keyword_responses: newResponses
    });
  };

  const addCommentVariant = () => {
    if (newVariant.trim() && !commentVariants.includes(newVariant.trim())) {
      setCommentVariants([...commentVariants, newVariant.trim()]);
      setNewVariant("");
    }
  };

  const removeCommentVariant = (index: number) => {
    setCommentVariants(commentVariants.filter((_, i) => i !== index));
  };

  const duplicateVariant = (text: string) => {
    if (!commentVariants.includes(text)) {
      setCommentVariants([...commentVariants, text]);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Automating Comment Replies - Stay Informed</h3>
              <p className="text-sm text-orange-800 mt-1">
                Automating comment replies comes with risks:
              </p>
              <ul className="text-sm text-orange-800 mt-2 ml-4 space-y-1 list-disc">
                <li>Instagram may rate-limit or temporarily restrict your account</li>
                <li>Too frequent responses can trigger spam detection</li>
                <li>Patterns that look automated can harm your engagement</li>
                <li>Use realistic delays and vary your responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            DM Automation Settings
          </CardTitle>
          <CardDescription>
            Configure automatic responses for Instagram Direct Messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="welcome" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="welcome" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Welcome
              </TabsTrigger>
              <TabsTrigger value="story" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Story Reply
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Keywords
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="welcome" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="welcome-enabled">Enable Welcome Message</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically send a message to new followers
                    </p>
                  </div>
                  <Switch
                    id="welcome-enabled"
                    checked={dmAutomation.welcome_message?.enabled || false}
                    onCheckedChange={(checked) =>
                      setDmAutomation({
                        ...dmAutomation,
                        welcome_message: {
                          ...dmAutomation.welcome_message!,
                          enabled: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Thanks for following! Check out our latest products..."
                    value={dmAutomation.welcome_message?.message || ""}
                    onChange={(e) =>
                      setDmAutomation({
                        ...dmAutomation,
                        welcome_message: {
                          ...dmAutomation.welcome_message!,
                          message: e.target.value
                        }
                      })
                    }
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{username}"} to include the follower's name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome-delay" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Delay (seconds)
                  </Label>
                  <Input
                    id="welcome-delay"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={dmAutomation.welcome_message?.delay || 0}
                    onChange={(e) =>
                      setDmAutomation({
                        ...dmAutomation,
                        welcome_message: {
                          ...dmAutomation.welcome_message!,
                          delay: parseInt(e.target.value) || 0
                        }
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Wait time before sending the welcome message
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="story" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="story-enabled">Enable Story Reply</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-reply when someone replies to your story
                    </p>
                  </div>
                  <Switch
                    id="story-enabled"
                    checked={dmAutomation.story_reply?.enabled || false}
                    onCheckedChange={(checked) =>
                      setDmAutomation({
                        ...dmAutomation,
                        story_reply: {
                          ...dmAutomation.story_reply!,
                          enabled: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-message">Story Reply Message</Label>
                  <Textarea
                    id="story-message"
                    placeholder="Thanks for watching my story! Feel free to ask any questions..."
                    value={dmAutomation.story_reply?.message || ""}
                    onChange={(e) =>
                      setDmAutomation({
                        ...dmAutomation,
                        story_reply: {
                          ...dmAutomation.story_reply!,
                          message: e.target.value
                        }
                      })
                    }
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{username}"} to include the viewer's name
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Keyword-Based Auto-Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically reply when specific keywords are detected in messages
                  </p>
                </div>

                {/* Add new keyword response */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Keyword Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter keyword..."
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addKeyword}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentKeywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeKeyword(index)}
                          >
                            {keyword}
                            <Trash2 className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Response</Label>
                      <Textarea
                        placeholder="Enter auto-response message..."
                        value={keywordResponse}
                        onChange={(e) => setKeywordResponse(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={addKeywordResponse}
                      disabled={currentKeywords.length === 0 || !keywordResponse.trim()}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Keyword Response
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing keyword responses */}
                <div className="space-y-2">
                  {dmAutomation.keyword_responses?.map((response, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap gap-1">
                              {response.keywords.map((keyword, kIndex) => (
                                <Badge key={kIndex} variant="outline">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm">{response.response}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKeywordResponse(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Comment Reply Variants</Label>
                  <p className="text-sm text-muted-foreground">
                    Add multiple reply variants. One will be randomly selected for each reply to avoid looking like a bot.
                  </p>
                </div>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shuffle className="w-4 h-4" />
                        Use Random Variants
                      </Label>
                      <Switch
                        checked={useRandomVariants}
                        onCheckedChange={setUseRandomVariants}
                      />
                      <p className="text-xs text-muted-foreground">
                        When enabled, a random variant will be selected for each reply
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Delay Between Replies (ms)
                      </Label>
                      <Input
                        type="number"
                        min="1000"
                        max="60000"
                        step="1000"
                        value={commentDelayMs}
                        onChange={(e) => setCommentDelayMs(parseInt(e.target.value) || 5000)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Realistic delays (5000-30000ms) help avoid bot detection
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Replies Per Day</Label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={maxRepliesPerDay}
                        onChange={(e) => setMaxRepliesPerDay(parseInt(e.target.value) || 100)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Limit daily replies to avoid rate limiting
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Add variant */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Variant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Reply Text</Label>
                      <Textarea
                        placeholder="Type a reply variant..."
                        value={newVariant}
                        onChange={(e) => setNewVariant(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={addCommentVariant}
                      disabled={!newVariant.trim()}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variant ({commentVariants.length})
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing variants */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Your Variants ({commentVariants.length})</h3>
                  {commentVariants.map((variant, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm flex-1">{variant}</p>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateVariant(variant + " (copy)")}
                              title="Duplicate variant"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCommentVariant(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {commentVariants.length === 0 && (
                    <p className="text-sm text-muted-foreground p-3">No variants added yet</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveDmAutomation} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${dmAutomation.welcome_message?.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div>
                <p className="text-sm font-medium">Welcome Message</p>
                <p className="text-xs text-muted-foreground">
                  {dmAutomation.welcome_message?.enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${dmAutomation.story_reply?.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div>
                <p className="text-sm font-medium">Story Reply</p>
                <p className="text-xs text-muted-foreground">
                  {dmAutomation.story_reply?.enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${(dmAutomation.keyword_responses?.length || 0) > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div>
                <p className="text-sm font-medium">Keyword Responses</p>
                <p className="text-xs text-muted-foreground">
                  {dmAutomation.keyword_responses?.length || 0} active
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
