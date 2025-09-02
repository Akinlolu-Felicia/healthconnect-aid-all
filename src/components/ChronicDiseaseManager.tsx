import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Plus, 
  Calendar as CalendarIcon,
  Target,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface ChronicDiseasePlan {
  id: string;
  condition_name: string;
  diagnosis_date?: string;
  severity: string;
  treatment_plan?: string;
  goals: string[];
  is_active: boolean;
}

interface HealthMetric {
  id: string;
  metric_type: string;
  value_numeric?: number;
  systolic?: number;
  diastolic?: number;
  recorded_at: string;
  notes?: string;
}

const ChronicDiseaseManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<ChronicDiseasePlan[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const [newPlan, setNewPlan] = useState({
    condition_name: "",
    diagnosis_date: "",
    severity: "mild",
    treatment_plan: "",
    goals: ""
  });

  const commonConditions = [
    "Type 2 Diabetes",
    "Hypertension",
    "Heart Disease",
    "Asthma",
    "COPD",
    "Arthritis",
    "Depression",
    "Anxiety",
    "Chronic Pain",
    "Fibromyalgia",
    "Migraine",
    "Inflammatory Bowel Disease",
    "Other"
  ];

  const severityLevels = [
    { value: "mild", label: "Mild", color: "bg-green-100 text-green-800" },
    { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
    { value: "severe", label: "Severe", color: "bg-red-100 text-red-800" }
  ];

  useEffect(() => {
    if (user) {
      fetchChronicDiseasePlans();
      fetchRecentMetrics();
    }
  }, [user]);

  const fetchChronicDiseasePlans = async () => {
    try {
      const { data, error } = await supabase
        .from("chronic_disease_plans")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching chronic disease plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMetrics = async () => {
    try {
      const weekStart = startOfWeek(new Date());
      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user?.id)
        .gte("recorded_at", weekStart.toISOString())
        .order("recorded_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentMetrics(data || []);
    } catch (error) {
      console.error("Error fetching recent metrics:", error);
    }
  };

  const addChronicDiseasePlan = async () => {
    if (!newPlan.condition_name) {
      toast({
        title: "Missing Information",
        description: "Please select a condition.",
        variant: "destructive"
      });
      return;
    }

    try {
      const goals = newPlan.goals ? newPlan.goals.split(",").map(goal => goal.trim()) : [];
      
      const { error } = await supabase
        .from("chronic_disease_plans")
        .insert({
          user_id: user?.id,
          condition_name: newPlan.condition_name,
          diagnosis_date: newPlan.diagnosis_date || null,
          severity: newPlan.severity,
          treatment_plan: newPlan.treatment_plan || null,
          goals
        });

      if (error) throw error;

      toast({
        title: "Plan Created",
        description: "Your chronic disease management plan has been created."
      });

      setNewPlan({
        condition_name: "",
        diagnosis_date: "",
        severity: "mild",
        treatment_plan: "",
        goals: ""
      });
      setSelectedDate(undefined);
      setShowAddForm(false);
      fetchChronicDiseasePlans();
    } catch (error) {
      console.error("Error adding chronic disease plan:", error);
      toast({
        title: "Error",
        description: "Failed to create chronic disease plan.",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const level = severityLevels.find(s => s.value === severity);
    return <Badge className={level?.color || "bg-gray-100 text-gray-800"}>{level?.label || severity}</Badge>;
  };

  const getMetricTrend = (metricType: string) => {
    const metrics = recentMetrics.filter(m => m.metric_type === metricType);
    if (metrics.length < 2) return null;
    
    const latest = metrics[0];
    const previous = metrics[1];
    
    let latestValue = latest.value_numeric;
    let previousValue = previous.value_numeric;
    
    if (metricType === "blood_pressure") {
      latestValue = latest.systolic;
      previousValue = previous.systolic;
    }
    
    if (!latestValue || !previousValue) return null;
    
    const trend = latestValue > previousValue ? "up" : latestValue < previousValue ? "down" : "stable";
    return { trend, latest: latestValue, previous: previousValue };
  };

  const getGoalProgress = (goals: string[]) => {
    // This is a simplified progress calculation
    // In a real app, this would track actual goal completion
    return Math.floor(Math.random() * 100);
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Chronic Disease Management</h2>
        <p>Please sign in to manage your chronic conditions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Chronic Disease Management</h1>
        <p className="text-muted-foreground">Comprehensive tools for managing your long-term health conditions</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="tracking">Health Tracking</TabsTrigger>
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Conditions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Active Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading your conditions...</p>
              ) : plans.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No chronic conditions tracked yet.</p>
                  <Button onClick={() => setShowAddForm(true)} variant="medical">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Condition
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{plan.condition_name}</h3>
                          {getSeverityBadge(plan.severity)}
                        </div>
                        {plan.diagnosis_date && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Diagnosed: {format(new Date(plan.diagnosis_date), "MMM yyyy")}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {plan.goals.length} active goals
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                This Week's Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMetrics.length === 0 ? (
                <p className="text-muted-foreground">No health metrics recorded this week.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["blood_pressure", "blood_sugar", "weight"].map((metricType) => {
                    const trend = getMetricTrend(metricType);
                    const latestMetric = recentMetrics.find(m => m.metric_type === metricType);
                    
                    if (!latestMetric) return null;
                    
                    return (
                      <div key={metricType} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{metricType.replace("_", " ")}</h4>
                          {trend && (
                            <div className={`flex items-center gap-1 text-sm ${
                              trend.trend === "up" ? "text-red-600" : 
                              trend.trend === "down" ? "text-green-600" : "text-gray-600"
                            }`}>
                              <TrendingUp className={`h-4 w-4 ${
                                trend.trend === "down" ? "rotate-180" : ""
                              }`} />
                              {trend.trend}
                            </div>
                          )}
                        </div>
                        <p className="text-lg font-semibold">
                          {metricType === "blood_pressure" 
                            ? `${latestMetric.systolic}/${latestMetric.diastolic}`
                            : latestMetric.value_numeric
                          }
                          {metricType === "blood_sugar" && " mg/dL"}
                          {metricType === "weight" && " lbs"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(latestMetric.recorded_at), "MMM dd")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Chronic Disease Plans</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)} variant="medical">
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </div>

          {/* Add Plan Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Chronic Disease Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <select
                      id="condition"
                      value={newPlan.condition_name}
                      onChange={(e) => setNewPlan({ ...newPlan, condition_name: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select condition</option>
                      {commonConditions.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <select
                      id="severity"
                      value={newPlan.severity}
                      onChange={(e) => setNewPlan({ ...newPlan, severity: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      {severityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Diagnosis Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setNewPlan({ 
                              ...newPlan, 
                              diagnosis_date: date ? format(date, "yyyy-MM-dd") : "" 
                            });
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="treatment">Treatment Plan</Label>
                  <Textarea
                    id="treatment"
                    value={newPlan.treatment_plan}
                    onChange={(e) => setNewPlan({ ...newPlan, treatment_plan: e.target.value })}
                    placeholder="Describe your current treatment plan..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goals">Health Goals (comma-separated)</Label>
                  <Textarea
                    id="goals"
                    value={newPlan.goals}
                    onChange={(e) => setNewPlan({ ...newPlan, goals: e.target.value })}
                    placeholder="Exercise 3x per week, Monitor blood sugar daily, Take medications as prescribed"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addChronicDiseasePlan} variant="medical">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Plans */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.condition_name}</h3>
                      {plan.diagnosis_date && (
                        <p className="text-sm text-muted-foreground">
                          Diagnosed: {format(new Date(plan.diagnosis_date), "MMMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(plan.severity)}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {plan.treatment_plan && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Treatment Plan</h4>
                      <p className="text-sm text-muted-foreground">{plan.treatment_plan}</p>
                    </div>
                  )}

                  {plan.goals.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Health Goals</h4>
                      <div className="space-y-2">
                        {plan.goals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Health Metric Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track your health metrics in the Health Dashboard. This data helps monitor your chronic conditions.
              </p>
              <Button variant="medical">
                <Activity className="h-4 w-4 mr-2" />
                Go to Health Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Goals & Progress</h2>
            
            {plans.map((plan) => (
              plan.goals.length > 0 && (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.condition_name} Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.goals.map((goal, index) => {
                        const progress = getGoalProgress(plan.goals);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{goal}</span>
                              <span className="text-sm text-muted-foreground">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChronicDiseaseManager;
