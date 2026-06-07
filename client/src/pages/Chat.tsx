import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("general");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = trpc.chat.getMessages.useQuery({ roomId, limit: 100 });
  const sendMutation = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
      setLoading(false);
      scrollToBottom();
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      await sendMutation.mutateAsync({ roomId, message: messageText });
      setMessageText("");
      setMessages([...messages, { userId: user.id, message: messageText, createdAt: new Date(), user }]);
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6 h-screen flex flex-col">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="flex-1 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Chat</h1>
        <p className="text-muted-foreground">Room: <span className="font-mono bg-muted px-2 py-1 rounded">{roomId}</span></p>
      </div>

      <Card className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  msg.userId === user?.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-background border border-border"
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-70">
                  {msg.user?.name || "Anonymous"}
                </p>
                <p className="text-sm break-words">{msg.message}</p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!user}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={sendMutation.isPending || !user}
          size="icon"
        >
          {sendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {!user && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-900">Please log in to send messages</p>
        </Card>
      )}
    </div>
  );
}
