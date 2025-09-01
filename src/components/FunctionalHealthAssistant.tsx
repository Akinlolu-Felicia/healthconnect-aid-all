import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  is_bot: boolean;
  created_at: string;
  session_id: string;
}

export const FunctionalHealthAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Add welcome message for new sessions
        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          content: "Hello! I'm your AI Health Assistant. I can help you with general health questions, symptom guidance, and wellness tips. How can I help you today?",
          is_bot: true,
          created_at: new Date().toISOString(),
          session_id: sessionId,
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await supabase.from("chat_messages").insert([{
          id: welcomeMessage.id,
          user_id: user.id,
          session_id: sessionId,
          content: welcomeMessage.content,
          is_bot: true,
        }]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const saveMessage = async (message: Omit<Message, "created_at">) => {
    if (!user) return;

    try {
      await supabase.from("chat_messages").insert([{
        id: message.id,
        user_id: user.id,
        session_id: message.session_id,
        content: message.content,
        is_bot: message.is_bot,
      }]);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("headache") || message.includes("migraine")) {
      return "I understand you're experiencing headaches. Common causes include dehydration, stress, lack of sleep, or eye strain. For relief, try:\n\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Stay hydrated\n• Practice relaxation techniques\n\nIf headaches persist, are severe, or accompanied by other symptoms like fever, vision changes, or neck stiffness, please consult a healthcare provider immediately.";
    }
    
    if (message.includes("fever") || message.includes("temperature")) {
      return "Fever is your body's natural response to infection. Here's what you should know:\n\n• Monitor your temperature regularly\n• Stay hydrated with water, clear broths, or electrolyte solutions\n• Rest and avoid strenuous activities\n• Consider fever-reducing medications as directed\n\nSeek immediate medical attention if:\n• Temperature exceeds 103°F (39.4°C)\n• Difficulty breathing\n• Persistent vomiting\n• Signs of dehydration\n• Fever lasts more than 3 days";
    }
    
    if (message.includes("cough") || message.includes("throat")) {
      return "For cough and throat discomfort, try these remedies:\n\n• Stay hydrated - warm liquids can be especially soothing\n• Use a humidifier or breathe steam from a hot shower\n• Honey can help soothe throat irritation (not for children under 1 year)\n• Gargle with warm salt water\n• Avoid irritants like smoke\n\nConsult a healthcare provider if:\n• Cough persists more than 2 weeks\n• Coughing up blood\n• High fever or difficulty breathing\n• Chest pain";
    }
    
    if (message.includes("diet") || message.includes("nutrition") || message.includes("eating")) {
      return "Here are some general nutrition tips for good health:\n\n• Eat a variety of colorful fruits and vegetables\n• Choose whole grains over refined grains\n• Include lean proteins (fish, poultry, beans, nuts)\n• Limit processed foods and added sugars\n• Stay hydrated with water\n• Practice portion control\n\nFor personalized dietary advice, especially if you have health conditions or specific goals, consult with a registered dietitian or your healthcare provider.";
    }
    
    if (message.includes("sleep") || message.includes("insomnia") || message.includes("tired")) {
      return "Good sleep is essential for health. Here are tips for better sleep:\n\n• Maintain a consistent sleep schedule\n• Create a relaxing bedtime routine\n• Keep your bedroom cool, dark, and quiet\n• Avoid caffeine, large meals, and screens before bedtime\n• Get regular exercise (but not close to bedtime)\n• Limit daytime naps\n\nIf sleep problems persist, consider consulting a healthcare provider as it could indicate an underlying condition.";
    }
    
    if (message.includes("stress") || message.includes("anxiety") || message.includes("worried")) {
      return "Managing stress and anxiety is important for overall health:\n\n• Practice deep breathing exercises\n• Try meditation or mindfulness\n• Regular physical activity can help\n• Maintain social connections\n• Set realistic goals and priorities\n• Consider talking to someone you trust\n\nIf anxiety or stress significantly impacts your daily life, don't hesitate to reach out to a mental health professional. Your mental health is just as important as your physical health.";
    }
    
    if (message.includes("exercise") || message.includes("workout") || message.includes("fitness")) {
      return "Regular exercise has numerous health benefits:\n\n• Aim for at least 150 minutes of moderate aerobic activity per week\n• Include strength training exercises 2+ days per week\n• Start slowly and gradually increase intensity\n• Choose activities you enjoy\n• Listen to your body and rest when needed\n\nBefore starting any new exercise program, especially if you have health conditions, consult with your healthcare provider.";
    }
    
    if (message.includes("emergency") || message.includes("urgent") || message.includes("911")) {
      return "🚨 If this is a medical emergency, please call 911 immediately or go to the nearest emergency room.\n\nSeek immediate medical attention for:\n• Chest pain or difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n• Severe allergic reactions\n• Signs of stroke (face drooping, arm weakness, speech difficulty)\n• Severe burns or injuries\n\nFor non-emergency situations, you can also contact your healthcare provider or use telehealth services.";
    }
    
    if (message.includes("medication") || message.includes("medicine") || message.includes("pill")) {
      return "Important medication safety tips:\n\n• Always follow your healthcare provider's instructions\n• Take medications as prescribed - don't skip doses or stop early\n• Keep an updated list of all medications\n• Check expiration dates regularly\n• Store medications properly\n• Never share prescription medications\n• Be aware of potential side effects\n\nFor specific questions about your medications, always consult your healthcare provider or pharmacist.";
    }
    
    // Default response
    return "Thank you for your question. While I can provide general health information, I always recommend consulting with a qualified healthcare provider for personalized medical advice. They can properly evaluate your specific situation and provide appropriate care.\n\nIs there a specific health topic you'd like general information about? I can help with topics like nutrition, exercise, sleep hygiene, stress management, and general wellness tips.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || !user) return;

    setLoading(true);
    
    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputMessage.trim(),
      is_bot: false,
      created_at: new Date().toISOString(),
      session_id: sessionId,
    };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message
    await saveMessage(userMessage);
    
    // Clear input
    setInputMessage("");

    // Simulate bot processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate bot response
    const botResponse = generateBotResponse(userMessage.content);
    
    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botResponse,
      is_bot: true,
      created_at: new Date().toISOString(),
      session_id: sessionId,
    };

    // Add bot message to state
    setMessages(prev => [...prev, botMessage]);
    
    // Save bot message
    await saveMessage(botMessage);
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bot className="h-5 w-5 text-primary" />
          AI Health Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.is_bot ? "justify-start" : "justify-end"}`}
              >
                {message.is_bot && (
                  <Avatar className="w-8 h-8 bg-primary">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.is_bot
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(message.created_at), "h:mm a")}
                  </p>
                </div>
                {!message.is_bot && (
                  <Avatar className="w-8 h-8 bg-secondary">
                    <AvatarFallback>
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about symptoms, health tips, or general wellness..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              size="icon"
              variant="medical"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 This AI provides general health information only. Always consult healthcare providers for medical advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};