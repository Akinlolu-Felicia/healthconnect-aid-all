import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export const HealthAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Health Assistant. I can help you with symptom checking, health education, and general medical guidance. What would you like to know today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputMessage("");
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("headache") || lowerInput.includes("head")) {
      return "Headaches can have various causes including stress, dehydration, lack of sleep, or eye strain. Try drinking water, resting in a dark room, and applying a cold compress. If headaches persist or are severe, please consult a healthcare professional.";
    }
    
    if (lowerInput.includes("fever") || lowerInput.includes("temperature")) {
      return "Fever is often a sign your body is fighting an infection. Rest, stay hydrated, and monitor your temperature. For adults, consider fever-reducing medication if comfortable. Seek medical attention if fever exceeds 103°F (39.4°C) or persists.";
    }
    
    if (lowerInput.includes("cough")) {
      return "Coughs can be caused by various factors including viral infections, allergies, or irritants. Stay hydrated, use honey for soothing, and avoid irritants. If cough persists for more than 2 weeks or includes blood, consult a doctor.";
    }
    
    if (lowerInput.includes("diet") || lowerInput.includes("nutrition")) {
      return "A balanced diet includes fruits, vegetables, whole grains, lean proteins, and healthy fats. Aim for 5-9 servings of fruits and vegetables daily, stay hydrated, and limit processed foods. Consider consulting a nutritionist for personalized advice.";
    }
    
    return "Thank you for your question. While I can provide general health information, it's important to consult with a healthcare professional for personalized medical advice. Is there anything specific about your symptoms you'd like to discuss?";
  };

  return (
    <Card className="h-[500px] flex flex-col shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary-light to-secondary-light">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="h-6 w-6" />
          AI Health Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {!message.isBot && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex gap-2">
          <Input
            placeholder="Describe your symptoms or ask a health question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" variant="medical">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};