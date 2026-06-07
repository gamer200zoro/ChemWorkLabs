import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Zap, Award } from "lucide-react";

export default function Quiz() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const quizQuery = trpc.quiz.list.useQuery();
  const submitAnswerMutation = trpc.quiz.submitAnswer.useMutation();
  const completeQuizMutation = trpc.quiz.completeQuiz.useMutation();

  useEffect(() => {
    if (quizQuery.data) {
      setQuizzes(quizQuery.data);
      setLoading(false);
    }
  }, [quizQuery.data]);

  const handleSelectQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setScore(0);
    setAnswered([]);
    setIsComplete(false);
  };

  const handleAnswerQuestion = async (isCorrect: boolean) => {
    if (!selectedQuiz) return;

    const newAnswered = [...answered];
    newAnswered[currentQuestion] = isCorrect;
    setAnswered(newAnswered);

    if (isCorrect) {
      setScore(score + 1);
    }

    await submitAnswerMutation.mutateAsync({
      quizId: selectedQuiz.id,
      questionId: selectedQuiz.questions[currentQuestion].id,
      answer: currentQuestion,
      isCorrect,
    });

    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    } else {
      await completeQuizMutation.mutateAsync({ quizId: selectedQuiz.id });
      setIsComplete(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (selectedQuiz && !isComplete) {
    const question = selectedQuiz.questions[currentQuestion];
    const options = JSON.parse(question.options);
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{selectedQuiz.title}</h1>
          <Badge variant="outline">{currentQuestion + 1}/{selectedQuiz.questions.length}</Badge>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">{question.question}</h2>
            <div className="space-y-3">
              {options.map((option: string, idx: number) => (
                <Button
                  key={idx}
                  variant={answered[currentQuestion] !== undefined ? "outline" : "default"}
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleAnswerQuestion(idx === question.correctAnswer)}
                  disabled={answered[currentQuestion] !== undefined}
                >
                  <span className="mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {answered[currentQuestion] !== undefined && (
            <div className={`p-4 rounded-lg ${answered[currentQuestion] ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                {answered[currentQuestion] ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Incorrect</span>
                  </>
                )}
              </div>
              {question.explanation && (
                <p className="text-sm">{question.explanation}</p>
              )}
            </div>
          )}
        </Card>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Score: {score}/{currentQuestion + 1}</span>
          {answered[currentQuestion] !== undefined && (
            <Button onClick={() => handleAnswerQuestion(false)}>
              {currentQuestion < selectedQuiz.questions.length - 1 ? "Next" : "Finish"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center space-y-6">
          <Award className="w-16 h-16 mx-auto text-accent" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-muted-foreground">You scored {score} out of {selectedQuiz.questions.length}</p>
          </div>

          <div className="bg-accent/10 rounded-lg p-6">
            <div className="text-5xl font-bold text-accent mb-2">{percentage}%</div>
            <p className="text-sm text-muted-foreground">
              {percentage >= 80 ? "Excellent work!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
            </p>
          </div>

          <Button onClick={() => setSelectedQuiz(null)} className="w-full">
            Back to Quizzes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chemistry Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge with interactive quizzes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectQuiz(quiz)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
              </div>
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div className="flex gap-2 mt-4">
              <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
              {quiz.category && <Badge variant="outline">{quiz.category}</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No quizzes available yet. Check back soon!</p>
        </Card>
      )}
    </div>
  );
}
