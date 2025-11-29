import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Save, X } from "lucide-react";

interface ReelAutomation {
  enabled: boolean;
  replyType: "same" | "random";
  sameReply?: string;
  randomReplies?: string[];
  delayMs: number;
  maxRepliesPerDay: number;
}

interface ReelAutomationFormProps {
  reelCaption?: string;
  onSave: (automation: ReelAutomation) => void;
  onCancel: () => void;
  initialData?: ReelAutomation;
}

export function ReelAutomationForm({
  reelCaption,
  onSave,
  onCancel,
  initialData
}: ReelAutomationFormProps) {
  const [automation, setAutomation] = useState<ReelAutomation>(
    initialData || {
      enabled: false,
      replyType: "same",
      sameReply: "Thanks for your comment! 🙏",
      randomReplies: [
        "Thanks for your comment! 🙏",
        "Appreciate your feedback!",
        "Thanks for engaging with us!"
      ],
      delayMs: 5000,
      maxRepliesPerDay: 100
    }
  );

  const handleAddRandomReply = () => {
    setAutomation({
      ...automation,
      randomReplies: [...(automation.randomReplies || []), ""]
    });
  };

  const handleRemoveRandomReply = (index: number) => {
    setAutomation({
      ...automation,
      randomReplies: automation.randomReplies?.filter((_, i) => i !== index) || []
    });
  };

  const handleUpdateRandomReply = (index: number, value: string) => {
    const updated = [...(automation.randomReplies || [])];
    updated[index] = value;
    setAutomation({
      ...automation,
      randomReplies: updated
    });
  };

  const handleSave = () => {
    // Validate
    if (automation.replyType === "same" && !automation.sameReply?.trim()) {
      alert("Please enter a reply message");
      return;
    }
    if (automation.replyType === "random") {
      const validReplies = automation.randomReplies?.filter(r => r.trim()) || [];
      if (validReplies.length < 2) {
        alert("Please add at least 2 different replies for random mode");
        return;
      }
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
              <p className="font-semibold text-orange-900">Stay Informed</p>
              <p className="text-orange-800 text-xs mt-1">
                Automating replies can trigger rate-limiting. Use realistic delays and vary your responses.
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

      {/* Reply Type Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How to Reply?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Same Reply Option */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroup value={automation.replyType} onValueChange={(value: string) =>
                setAutomation({ ...automation, replyType: value as "same" | "random" })
              }>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="same" id="same" />
                  <Label htmlFor="same" className="cursor-pointer font-medium text-sm">
                    Same Reply Every Time
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {automation.replyType === "same" && (
              <div className="ml-6 space-y-2">
                <Label className="text-xs text-gray-600">Reply Message</Label>
                <Textarea
                  placeholder="Type your reply..."
                  value={automation.sameReply || ""}
                  onChange={(e) =>
                    setAutomation({ ...automation, sameReply: e.target.value })
                  }
                  rows={2}
                  className="text-sm"
                />
              </div>
            )}

            {/* Random Replies Option */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroup value={automation.replyType} onValueChange={(value: string) =>
                setAutomation({ ...automation, replyType: value as "same" | "random" })
              }>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="cursor-pointer font-medium text-sm">
                    Random Replies (Different Each Time)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {automation.replyType === "random" && (
              <div className="ml-6 space-y-2">
                <Label className="text-xs text-gray-600">
                  Add 2+ Different Replies (One will be randomly selected)
                </Label>
                <div className="space-y-2">
                  {automation.randomReplies?.map((reply, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder={`Reply #${index + 1}...`}
                        value={reply}
                        onChange={(e) =>
                          handleUpdateRandomReply(index, e.target.value)
                        }
                        rows={1}
                        className="text-sm flex-1"
                      />
                      {automation.randomReplies && automation.randomReplies.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRandomReply(index)}
                          className="h-9 w-9"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddRandomReply}
                  className="w-full text-xs"
                >
                  + Add Another Reply
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delay */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Delay Between Replies</Label>
              <span className="text-xs text-gray-600">{automation.delayMs / 1000}s</span>
            </div>
            <Input
              type="range"
              min="1000"
              max="30000"
              step="1000"
              value={automation.delayMs}
              onChange={(e) =>
                setAutomation({ ...automation, delayMs: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Realistic delays (5-30 seconds) help avoid bot detection
            </p>
          </div>

          {/* Max Replies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="max-replies" className="text-sm font-medium">
                Max Replies Per Day
              </Label>
              <span className="text-xs text-gray-600">{automation.maxRepliesPerDay}</span>
            </div>
            <Input
              id="max-replies"
              type="number"
              min="10"
              max="500"
              value={automation.maxRepliesPerDay}
              onChange={(e) =>
                setAutomation({
                  ...automation,
                  maxRepliesPerDay: parseInt(e.target.value) || 100
                })
              }
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Limit replies per day to avoid rate limiting
            </p>
          </div>
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
