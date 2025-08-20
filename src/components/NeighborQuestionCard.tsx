import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, User, UserX } from "lucide-react";
import { useNeighborQuestions } from "@/hooks/useNeighborQuestions";
import { useAuth } from "@/contexts/AuthContext";

export const NeighborQuestionCard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { createQuestion, creating } = useNeighborQuestions();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    
    const success = await createQuestion({ 
      content: questionText.trim(),
      isAnonymous: isAnonymous
    });
    if (success) {
      setQuestionText("");
      setIsAnonymous(false);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setQuestionText("");
    setIsAnonymous(false);
  };

  if (isCreating) {
    return (
      <Card className="flex-shrink-0 w-72 bg-background border border-border rounded-lg p-4">
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="שאל שאלה לשכנים..."
          className="mb-3 min-h-[80px] resize-none"
          autoFocus
        />
        
        {/* Anonymous posting option */}
        <div className="flex items-center space-x-2 mb-3 justify-end">
          <label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
            פרסם כאנונימי
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
            {creating ? "פורסם..." : "פרסם"}
          </Button>
          <Button 
            onClick={handleCancel}
            variant="outline"
            size="sm"
            disabled={creating}
          >
            ביטול
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="flex-shrink-0 w-48 bg-background border border-dashed border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[120px] text-center"
      onClick={() => setIsCreating(true)}
    >
      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        הוסף שאלה חדשה
      </p>
    </Card>
  );
};