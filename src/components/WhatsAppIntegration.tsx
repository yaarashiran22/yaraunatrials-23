import { MessageCircle, Check, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const WhatsAppIntegration = () => {
  const webhookUrl = `https://nnosyzgguftgrvkfqcpc.supabase.co/functions/v1/whatsapp-webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
  };

  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">WhatsApp Bot</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Check className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Your Una AI assistant is connected to WhatsApp! Users can chat with Una directly through WhatsApp messages.
          </p>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Responds to WhatsApp messages using Una AI</li>
              <li>• Supports text conversations</li>
              <li>• Automatically handles user context</li>
              <li>• Provides local recommendations and information</li>
            </ul>
          </div>
          
          <div className="pt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">Webhook URL:</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{webhookUrl}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyWebhookUrl}
                  className="flex-shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://developers.facebook.com/docs/whatsapp', '_blank')}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Setup Guide
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WhatsAppIntegration;