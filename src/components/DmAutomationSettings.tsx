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
  Users
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
            <TabsList className="grid w-full grid-cols-3">
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
