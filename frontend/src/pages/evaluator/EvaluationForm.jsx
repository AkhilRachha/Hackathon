import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2, Send } from "lucide-react";
import { submitEvaluation } from "@/api/evaluationApi";

const EvaluationForm = ({ 
  selectedTeam, 
  setSelectedTeam, 
  myEvaluations, 
  onEvaluationSubmitted 
}) => {
  const [criteriaScores, setCriteriaScores] = useState({});
  const [evaluationFeedback, setEvaluationFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize scores when team is selected
  useState(() => {
    if (selectedTeam) {
      const initialScores = {};
      if (selectedTeam.q_id?.evaluationCriteria) {
        selectedTeam.q_id.evaluationCriteria.forEach(criteria => {
          initialScores[criteria.name] = "";
        });
      }
      
      // If team is already evaluated, populate existing scores
      const existingEvaluation = myEvaluations.find(evaluation => evaluation.team_id._id === selectedTeam._id);
      if (existingEvaluation) {
        existingEvaluation.scores.forEach(score => {
          initialScores[score.criteriaName] = score.score.toString();
        });
        setEvaluationFeedback(existingEvaluation.feedback || "");
      } else {
        setEvaluationFeedback("");
      }
      
      setCriteriaScores(initialScores);
    }
  }, [selectedTeam, myEvaluations]);

  const handleEvaluationSubmit = async () => {
    if (!selectedTeam) return;

    // Validate all criteria are scored
    const hasEmptyScores = Object.values(criteriaScores).some(score => !score);
    if (hasEmptyScores || !evaluationFeedback.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide scores for all criteria and feedback",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const evaluationData = {
        team_id: selectedTeam._id,
        scores: Object.entries(criteriaScores).map(([criteriaName, score]) => ({
          criteriaName,
          score: parseFloat(score)
        })),
        feedback: evaluationFeedback
      };

      await submitEvaluation(evaluationData);
      
      toast({
        title: "Success! 🎉",
        description: "Evaluation submitted successfully"
      });

      // Notify parent component
      if (onEvaluationSubmitted) {
        onEvaluationSubmitted();
      }
      
      // Close dialog
      setSelectedTeam(null);
      setCriteriaScores({});
      setEvaluationFeedback("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit evaluation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalScore = () => {
    const scores = Object.values(criteriaScores).filter(score => score !== "");
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + parseFloat(score), 0);
    return (total / scores.length).toFixed(1);
  };

  if (!selectedTeam) return null;

  return (
    <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Evaluate Team: {selectedTeam.team_name}
          </DialogTitle>
          <DialogDescription>
            Provide scores and feedback for this team's project submission
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Team Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Team Information</h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p><strong>Project:</strong> {selectedTeam.q_id?.q_title || "No Project"}</p>
                <p><strong>Description:</strong> {selectedTeam.q_id?.q_description || "No description"}</p>
                <div>
                  <strong>Members:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTeam.members?.map((member, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {member.user_name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Submission Times */}
                <div className="space-y-1">
                  <strong>Submission Times:</strong>
                  <div className="ml-2 space-y-1 text-sm">
                    {(() => {
                      // Based on the team model, submission times are stored as:
                      // - mid_submission.submitted_at for mid submission
                      // - github_submission.submitted_at for final submission
                      
                      const midTime = selectedTeam.mid_submission?.submitted_at;
                      const finalTime = selectedTeam.github_submission?.submitted_at;



                      return (
                        <>
                          {midTime ? (
                            <div className="text-blue-600">
                              <span className="font-medium">Mid Submission:</span> {new Date(midTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500">Mid Submission: Not submitted</div>
                          )}
                          {finalTime ? (
                            <div className="text-green-600">
                              <span className="font-medium">Final Submission:</span> {new Date(finalTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500">Final Submission: Not submitted</div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <p>
                  <strong>Repository:</strong>{" "}
                  {selectedTeam.github_submission?.url ? (
                    <a 
                      href={selectedTeam.github_submission.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on GitHub
                    </a>
                  ) : (
                    <span className="text-gray-500">Not submitted yet</span>
                  )}
                </p>
              </div>
            </div>

            {/* Total Score Display */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Current Total Score</h4>
              <div className="text-3xl font-bold text-blue-600">
                {calculateTotalScore()}/10
              </div>
            </div>
          </div>

          {/* Evaluation Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Evaluation Criteria</h3>
            
            {selectedTeam.q_id?.evaluationCriteria?.map((criteria, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`criteria-${index}`} className="font-medium">
                  {criteria.name} (Max: {criteria.maxScore})
                </Label>
                <Input
                  id={`criteria-${index}`}
                  type="number"
                  min="0"
                  max={criteria.maxScore}
                  step="0.1"
                  placeholder={`Score out of ${criteria.maxScore}`}
                  value={criteriaScores[criteria.name] || ""}
                  onChange={(e) => setCriteriaScores(prev => ({
                    ...prev,
                    [criteria.name]: e.target.value
                  }))}
                  className="h-11"
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="feedback" className="font-medium">
                Feedback & Comments
              </Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback about the team's project..."
                value={evaluationFeedback}
                onChange={(e) => setEvaluationFeedback(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleEvaluationSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit Evaluation
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedTeam(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationForm;