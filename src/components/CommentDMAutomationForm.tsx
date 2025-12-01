import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Save, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface CommentDMAutomation {
  enabled: boolean;
  triggerType: "any" | "keywords";
  keywords?: string[];
  commentReplies: string[];
  
  openingMessage: string;
  followCheckEnabled: boolean;
  followCheckMessage: string;
  followCheckRetries: number;
  continueAfterFollowCheck: "send" | "dont-send";
  
  primaryMessage: string;
  primaryButton: {
    text: string;
    url: string;
  };
  delayMs: number;
}

interface CommentDMAutomationFormProps {
  reelCaption?: string;
  onSave: (automation: CommentDMAutomation) => void;
  onCancel: () => void;
  initialData?: CommentDMAutomation;
}

export function CommentDMAutomationForm({
  reelCaption,
  onSave,
  onCancel,
  initialData
}: CommentDMAutomationFormProps) {
  const [automation, setAutomation] = useState<CommentDMAutomation>(
    initialData || {
      enabled: true,
      triggerType: "any",
      keywords: [],
      commentReplies: [
        "Thanks for your comment! 🙏",
        "Appreciate the love! ❤️",
        "Thanks for stopping by! 😊"
      ],
      openingMessage: "Hey! I'm so glad you're here - thanks a ton for stopping by 😊\n\nTap below and I'll send you the access in just a moment ✨",
      followCheckEnabled: true,
      followCheckMessage: "Oops! Looks like you haven't followed me yet 👀\nIt would mean a lot if you could visit my profile and hit that follow button 😁",
      followCheckRetries: 3,
      continueAfterFollowCheck: "send",
      primaryMessage: "Hi there!\n\nAppreciate your comment 🙌 As promised, here's the link for you ⬇️",
      primaryButton: {
        text: "Get Access",
        url: "https://yourlink.com"
      },
      delayMs: 5000
    }
  );

  const [newKeyword, setNewKeyword] = useState("");
  const [newReply, setNewReply] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    trigger: true,
    replies: true,
    opening: false,
    followCheck: false,
    primary: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !automation.keywords?.includes(newKeyword.trim())) {
      setAutomation({
        ...automation,
        keywords: [...(automation.keywords || []), newKeyword.trim()]
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setAutomation({
      ...automation,
      keywords: automation.keywords?.filter((_, i) => i !== index) || []
    });
  };

  const addReply = () => {
    if (newReply.trim() && !automation.commentReplies.includes(newReply.trim())) {
      setAutomation({
        ...automation,
        commentReplies: [...automation.commentReplies, newReply.trim()]
      });
      setNewReply("");
    }
  };

  const removeReply = (index: number) => {
    setAutomation({
      ...automation,
      commentReplies: automation.commentReplies.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (automation.commentReplies.length === 0) {
      alert("Please add at least one comment reply");
      return;
    }
    if (!automation.openingMessage.trim()) {
      alert("Please enter opening message");
      return;
    }
    if (!automation.primaryMessage.trim()) {
      alert("Please enter primary message");
      return;
    }
    if (!automation.primaryButton.text.trim() || !automation.primaryButton.url.trim()) {
      alert("Please enter button text and URL");
      return;
    }
    if (automation.triggerType === "keywords" && (!automation.keywords || automation.keywords.length === 0)) {
      alert("Please add at least one keyword");
      return;
    }
    onSave(automation);
  };

  return (
    <div className="space-y-4">
      {/* Risk Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-orange-900">Automating Comment DMs - Stay Informed</p>
              <p className="text-orange-800 text-xs mt-1">
                Sending DMs after comments can trigger rate-limiting. Use realistic delays and avoid spammy patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reel Info */}
      {reelCaption && (
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <p className="text-xs text-gray-600 font-medium">Reel:</p>
            <p className="text-sm text-gray-800 line-clamp-2">{reelCaption}</p>
          </CardContent>
        </Card>
      )}

      {/* Trigger Type & Keywords */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('trigger')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">1. When to Reply?</CardTitle>
            {expandedSections.trigger ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.trigger && (
          <CardContent className="space-y-3">
            <RadioGroup value={automation.triggerType} onValueChange={(value: string) =>
              setAutomation({ ...automation, triggerType: value as "any" | "keywords" })
            }>
              <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="any" id="trigger-any" />
                <Label htmlFor="trigger-any" className="cursor-pointer text-sm">
                  Any Comment (reply to all)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="keywords" id="trigger-keywords" />
                <Label htmlFor="trigger-keywords" className="cursor-pointer text-sm">
                  Specific Keywords Only
                </Label>
              </div>
            </RadioGroup>

            {automation.triggerType === "keywords" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-sm font-medium mb-2 block">Add keywords to watch for</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. price, info, buy..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={addKeyword} className="px-3">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {automation.keywords?.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {keyword}
                      <Trash2 className="w-3 h-3 ml-1" onClick={() => removeKeyword(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Comment Replies */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('replies')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">2. Comment Replies (Random Selection)</CardTitle>
            {expandedSections.replies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.replies && (
          <CardContent className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-2">✨ Add 2+ Different Replies</p>
              <p className="text-xs text-purple-800">One will be randomly selected for each comment</p>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter a comment reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <Button size="sm" onClick={addReply} className="px-3 h-fit">Add</Button>
            </div>
            <div className="space-y-2">
              {automation.commentReplies.map((reply, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-800 flex-1">{reply}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeReply(index)}
                    className="hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Opening Message (for DM) */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('opening')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">3. Opening DM Message</CardTitle>
            {expandedSections.opening ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.opening && (
          <CardContent className="space-y-2">
            <Label className="text-xs text-gray-600">First message they receive after commenting</Label>
            <Textarea
              value={automation.openingMessage}
              onChange={(e) =>
                setAutomation({ ...automation, openingMessage: e.target.value })
              }
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">💡 This DM is sent right after they comment</p>
          </CardContent>
        )}
      </Card>

      {/* Follow Check */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('followCheck')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">4. Follow Check (Optional)</CardTitle>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {expandedSections.followCheck ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <Switch
                checked={automation.followCheckEnabled}
                onCheckedChange={(checked) =>
                  setAutomation({ ...automation, followCheckEnabled: checked })
                }
              />
            </div>
          </div>
        </CardHeader>
        {expandedSections.followCheck && automation.followCheckEnabled && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600 mb-2">Message if not following</Label>
              <Textarea
                value={automation.followCheckMessage}
                onChange={(e) =>
                  setAutomation({ ...automation, followCheckMessage: e.target.value })
                }
                rows={2}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Retry attempts</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={automation.followCheckRetries}
                onChange={(e) =>
                  setAutomation({ ...automation, followCheckRetries: parseInt(e.target.value) })
                }
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">After {automation.followCheckRetries} retries, will {automation.continueAfterFollowCheck === "send" ? "send" : "not send"} main DM</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">If still not following:</Label>
              <RadioGroup value={automation.continueAfterFollowCheck} onValueChange={(value: string) =>
                setAutomation({ ...automation, continueAfterFollowCheck: value as "send" | "dont-send" })
              }>
                <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="send" id="continue-send" />
                  <Label htmlFor="continue-send" className="cursor-pointer text-sm">Send offer anyway</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="dont-send" id="continue-dont-send" />
                  <Label htmlFor="continue-dont-send" className="cursor-pointer text-sm">Don't send offer</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Primary Message */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('primary')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">5. Main Offer + Link</CardTitle>
            {expandedSections.primary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.primary && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600 mb-2">Your offer message</Label>
              <Textarea
                value={automation.primaryMessage}
                onChange={(e) =>
                  setAutomation({ ...automation, primaryMessage: e.target.value })
                }
                rows={3}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-2">Button text</Label>
              <Input
                value={automation.primaryButton.text}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    primaryButton: { ...automation.primaryButton, text: e.target.value }
                  })
                }
                className="text-sm"
                placeholder="e.g. Get Access"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-2">Button URL</Label>
              <Input
                value={automation.primaryButton.url}
                onChange={(e) =>
                  setAutomation({
                    ...automation,
                    primaryButton: { ...automation.primaryButton, url: e.target.value }
                  })
                }
                placeholder="https://yourlink.com"
                className="text-sm"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delay Setting */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Initial Delay</Label>
          <Input
            type="number"
            min="1000"
            max="30000"
            step="1000"
            value={automation.delayMs}
            onChange={(e) =>
              setAutomation({ ...automation, delayMs: parseInt(e.target.value) })
            }
          />
          <p className="text-xs text-gray-500 mt-1">{automation.delayMs / 1000}s delay before first DM (helps avoid detection)</p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Automation
        </Button>
      </div>
    </div>
  );
}
