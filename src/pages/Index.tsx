import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Bot, 
  Users, 
  Activity, 
  Shield, 
  Stethoscope,
  Brain,
  Clock,
  MapPin,
  Star
} from "lucide-react";
import { FunctionalHealthAssistant } from "@/components/FunctionalHealthAssistant";
import { FunctionalDoctorDirectory } from "@/components/FunctionalDoctorDirectory";
import { FunctionalHealthDashboard } from "@/components/FunctionalHealthDashboard";
import { EmergencySupport } from "@/components/EmergencySupport";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Bot,
      title: "AI Health Assistant",
      description: "Get instant answers to health questions and symptom guidance",
      color: "bg-primary-light text-primary",
    },
    {
      icon: Stethoscope,
      title: "Telemedicine",
      description: "Connect with certified doctors through video, voice, or chat",
      color: "bg-secondary-light text-secondary",
    },
    {
      icon: Activity,
      title: "Health Tracking",
      description: "Monitor vitals, medications, and track your wellness journey",
      color: "bg-success-light text-success",
    },
    {
      icon: Shield,
      title: "Emergency Support",
      description: "One-tap access to emergency services and SOS alerts",
      color: "bg-accent-light text-accent",
    },
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Doctors Available", value: "1,200+", icon: Stethoscope },
    { label: "Health Tips Shared", value: "10K+", icon: Brain },
    { label: "Emergency Responses", value: "500+", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HealthConnect</h1>
                <p className="text-xs text-muted-foreground">Good Health & Well-being</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-success" />
                Available 24/7
              </Badge>
              <Button 
                variant="medical" 
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation */}
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-5 w-fit bg-background/50 backdrop-blur-md shadow-lg">
              <TabsTrigger value="home" className="gap-2">
                <Heart className="h-4 w-4" />
                Home
              </TabsTrigger>
              <TabsTrigger value="assistant" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="doctors" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Find Doctors
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <Activity className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="emergency" className="gap-2">
                <Shield className="h-4 w-4" />
                Emergency
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold text-foreground">
                  Your Health,{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Connected
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Accessible, affordable, and preventive healthcare support powered by AI. 
                  Connect with doctors, track your health, and get emergency support anytime, anywhere.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="medical"
                  size="lg"
                  onClick={() => setActiveTab("assistant")}
                  className="gap-2"
                >
                  <Bot className="h-5 w-5" />
                  Start Health Chat
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveTab("doctors")}
                  className="gap-2"
                >
                  <Stethoscope className="h-5 w-5" />
                  Find a Doctor
                </Button>
              </div>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-2`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center shadow-md">
                    <CardContent className="p-6">
                      <IconComponent className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            {/* Quick Access */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab("assistant")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Bot className="h-5 w-5" />
                    AI Health Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Describe your symptoms and get instant guidance from our AI assistant.
                  </p>
                  <Button variant="outline" className="w-full">
                    Start Consultation
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab("doctors")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <Stethoscope className="h-5 w-5" />
                    Book Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with certified doctors through video calls, voice calls, or chat.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Find Doctors
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab("emergency")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Shield className="h-5 w-5" />
                    Emergency Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Quick access to emergency services and SOS alerts for urgent situations.
                  </p>
                  <Button variant="emergency" className="w-full">
                    Emergency Support
                  </Button>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="assistant">
            <FunctionalHealthAssistant />
          </TabsContent>

          <TabsContent value="doctors">
            <FunctionalDoctorDirectory />
          </TabsContent>

          <TabsContent value="dashboard">
            <FunctionalHealthDashboard />
          </TabsContent>

          <TabsContent value="emergency">
            <EmergencySupport />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">HealthConnect</span>
              <Badge variant="outline">SDG 3: Good Health & Well-being</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering communities with accessible healthcare solutions for a healthier tomorrow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
