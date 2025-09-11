import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, User, UserX, AlertTriangle, HelpCircle, MessageSquare } from "lucide-react";
import { useNeighborQuestions } from "@/hooks/useNeighborQuestions";
import { useAuth } from "@/contexts/AuthContext";

export const NeighborQuestionCard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [messageType, setMessageType] = useState<"alert" | "inquiry" | "help">("inquiry");
  const { createQuestion, creating } = useNeighborQuestions();
  const { user } = useAuth();

  const messageTypeOptions = [
    { value: "inquiry", label: "Inquiry", icon: MessageSquare },
    { value: "alert", label: "Alert", icon: AlertTriangle },
    { value: "help", label: "Need Help", icon: HelpCircle },
  ];

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    
    const success = await createQuestion({ 
      content: questionText.trim(),
      isAnonymous: isAnonymous,
      messageType: messageType
    });
    if (success) {
      setQuestionText("");
      setIsAnonymous(false);
      setMessageType("inquiry");
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setQuestionText("");
    setIsAnonymous(false);
    setMessageType("inquiry");
  };

  if (isCreating) {
    return (
      <Card className="flex-shrink-0 w-56 bg-background border border-border rounded-lg p-3">
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Write a note to neighbors..."
          className="mb-3 min-h-[80px] resize-none"
          autoFocus
        />
        
        {/* Message type selector */}
        <div className="mb-3">
          <label className="text-sm text-muted-foreground block mb-2">
            Message type
          </label>
          <Select value={messageType} onValueChange={(value: "alert" | "inquiry" | "help") => setMessageType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {messageTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        {/* Anonymous posting option */}
        <div className="flex items-center space-x-2 mb-3 justify-end">
          <label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
            Post anonymously
          </label>
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            className="ml-2"
          />
          {isAnonymous ? (
            <UserX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={!questionText.trim() || creating}
            size="sm"
            className="flex-1"
          >
            <Send className="h-4 w-4 ml-1" />
            {creating ? "Posting..." : "Post"}
          </Button>
          <Button 
            onClick={handleCancel}
            variant="outline"
            size="sm"
            disabled={creating}
          >
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="flex-shrink-0 w-40 bg-background border border-dashed border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[100px] text-center"
      onClick={() => setIsCreating(true)}
    >
      <Plus className="h-6 w-6 text-black mb-2" />
      <p className="text-xs text-muted-foreground">
        Add note
      </p>
    </Card>
  );
};