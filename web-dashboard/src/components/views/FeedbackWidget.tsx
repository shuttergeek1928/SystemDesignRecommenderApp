import { useState } from "react";
import { Card, Button, Input, Textarea } from "@/components/ui/base";
import { ThumbsUp, ThumbsDown, Send, MessageSquarePlus, CheckCircle2 } from "lucide-react";

interface FeedbackWidgetProps {
  sessionId: string;
  architectureDesign: Record<string, any>;
  onSubmitted?: () => void;
}

export function FeedbackWidget({ sessionId, architectureDesign, onSubmitted }: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [nodeFeedback, setNodeFeedback] = useState<Record<string, { isApproved: boolean; correction: string; reason: string }>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNodeToggle = (nodeKey: string, isApproved: boolean) => {
    setNodeFeedback(prev => ({
      ...prev,
      [nodeKey]: {
        isApproved,
        correction: prev[nodeKey]?.correction || "",
        reason: prev[nodeKey]?.reason || ""
      }
    }));
  };

  const updateNodeText = (nodeKey: string, field: 'correction' | 'reason', value: string) => {
    setNodeFeedback(prev => ({
      ...prev,
      [nodeKey]: {
        ...prev[nodeKey],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);
    
    const payload = {
      sessionId,
      overallRating: rating,
      generalComment,
      nodeFeedback: Object.entries(nodeFeedback).map(([nodeKey, fb]) => ({
        nodeKey,
        isApproved: fb.isApproved,
        correction: fb.correction,
        reason: fb.reason
      }))
    };

    try {
      await fetch("http://localhost:5220/api/Feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 bg-emerald-500/10 border-emerald-500/30 flex items-center justify-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Feedback submitted successfully. The AI will learn from this correction!
        </span>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <MessageSquarePlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Provide Architecture Feedback</h3>
          <p className="text-sm text-muted-foreground">Your corrections will train the model for future generations.</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="font-semibold mb-2">Overall Recommendation Quality</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors ${rating && rating >= star ? 'bg-amber-400 text-amber-900' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <p className="font-semibold mb-2">Node-Level Corrections (Optional)</p>
        {Object.keys(architectureDesign).map(nodeKey => {
          const isSelected = nodeFeedback[nodeKey] !== undefined;
          const fb = nodeFeedback[nodeKey];
          
          return (
            <div key={nodeKey} className="border border-border rounded-lg p-4 bg-background/50">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize">{nodeKey.replace(/_/g, ' ')}</span>
                <div className="flex gap-2">
                  <Button 
                    variant={fb?.isApproved === true ? "default" : "outline"} 
                    size="sm" 
                    className={fb?.isApproved === true ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    onClick={() => handleNodeToggle(nodeKey, true)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button 
                    variant={fb?.isApproved === false ? "default" : "outline"} 
                    size="sm"
                    className={fb?.isApproved === false ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                    onClick={() => handleNodeToggle(nodeKey, false)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" /> Correct
                  </Button>
                </div>
              </div>

              {fb?.isApproved === false && (
                <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">What should it be instead?</label>
                    <Input 
                      placeholder="e.g. Amazon DynamoDB" 
                      value={fb.correction}
                      onChange={(e) => updateNodeText(nodeKey, 'correction', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Why?</label>
                    <Input 
                      placeholder="e.g. Better for eventual consistency" 
                      value={fb.reason}
                      onChange={(e) => updateNodeText(nodeKey, 'reason', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-6 space-y-2">
        <label className="font-semibold">General Comments</label>
        <Textarea 
          placeholder="Any other feedback about this architecture?"
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
        />
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || !rating} 
        className="w-full h-12 text-lg font-bold"
      >
        {isSubmitting ? "Submitting..." : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Feedback to AI
          </>
        )}
      </Button>
    </Card>
  );
}
