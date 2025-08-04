import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Send } from "lucide-react";
import { useNeighborQuestions } from "@/hooks/useNeighborQuestions";
import { useAuth } from "@/contexts/AuthContext";

export const NeighborQuestionCard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const { createQuestion, creating } = useNeighborQuestions();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    
    const success = await createQuestion({ content: questionText.trim() });
    if (success) {
      setQuestionText("");
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setQuestionText("");
  };

  if (isCreating) {
    return (
      <Card className="flex-shrink-0 w-64 bg-background border border-border rounded-lg p-4">
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="שאל שאלה לשכנים..."
          className="mb-3 min-h-[80px] resize-none"
          autoFocus
        />
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
      onClick={() => user && setIsCreating(true)}
    >
      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {user ? "הוסף שאלה חדשה" : "התחבר כדי לשאול"}
      </p>
    </Card>
  );
};