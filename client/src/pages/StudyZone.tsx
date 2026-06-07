import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadGlossary } from "@/lib/dataLoader";

export default function StudyZone() {
  const [glossary, setGlossary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGlossary().then((data) => {
      setGlossary(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-8">Loading study materials...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📚 Study Zone</h1>
        <p className="text-muted-foreground">Learn chemistry with interactive study materials</p>
      </div>

      <Tabs defaultValue="glossary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="glossary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glossary?.glossary?.map((term: any) => (
              <Card key={term.id} className="p-4">
                <h3 className="font-bold text-lg mb-2">{term.term}</h3>
                <p className="text-sm text-muted-foreground mb-2">{term.definition}</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-accent/20 px-2 py-1 rounded">{term.category}</span>
                  <span className="text-xs bg-secondary/20 px-2 py-1 rounded capitalize">{term.difficulty}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          {glossary?.studyTopics?.map((topic: any) => (
            <Card key={topic.id} className="p-4">
              <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {topic.subtopics?.map((sub: string) => (
                  <span key={sub} className="text-xs bg-muted px-2 py-1 rounded">
                    {sub}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm">
                Study {topic.title}
              </Button>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {glossary?.quizzes?.map((quiz: any) => (
            <Card key={quiz.id} className="p-4">
              <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-secondary/20 px-2 py-1 rounded capitalize">{quiz.difficulty}</span>
                <Button size="sm">Start Quiz</Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
