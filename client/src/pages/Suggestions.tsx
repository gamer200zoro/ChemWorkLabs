import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ThumbsUp, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Suggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const suggestionsQuery = trpc.suggestion.list.useQuery({ status: filter });
  const createMutation = trpc.suggestion.create.useMutation();
  const voteMutation = trpc.suggestion.vote.useMutation();

  useEffect(() => {
    if (suggestionsQuery.data) {
      setSuggestions(suggestionsQuery.data);
      setLoading(false);
    }
  }, [suggestionsQuery.data]);

  const handleCreateSuggestion = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createMutation.mutateAsync({ title, description, category });
      setTitle("");
      setDescription("");
      setCategory("");
      toast.success("Suggestion submitted successfully!");
      suggestionsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create suggestion");
    }
  };

  const handleVote = async (suggestionId: number) => {
    try {
      await voteMutation.mutateAsync({ suggestionId });
      setSuggestions(
        suggestions.map((s) =>
          s.id === suggestionId ? { ...s, votes: (s.votes || 0) + 1 } : s
        )
      );
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "implemented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Suggestions</h1>
          <p className="text-muted-foreground">Share your ideas to improve the Chemistry Lab</p>
        </div>
        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Suggestion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit a Suggestion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Brief title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Detailed description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category (optional)</label>
                  <Input
                    placeholder="e.g., Feature, UI, Performance"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateSuggestion}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Suggestion"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "implemented"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filter === status ? undefined : status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge className={getStatusColor(suggestion.status)}>
                    {suggestion.status}
                  </Badge>
                  {suggestion.category && (
                    <Badge variant="outline">{suggestion.category}</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(suggestion.id)}
                className="w-full md:w-auto"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {suggestion.votes || 0}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No suggestions found. Be the first to suggest something!</p>
        </Card>
      )}
    </div>
  );
}
