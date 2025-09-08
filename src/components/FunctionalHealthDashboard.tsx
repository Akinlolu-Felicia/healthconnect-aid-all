import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Pill,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HealthMetric {
  id: string;
  metric_type: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  systolic: number | null;
  diastolic: number | null;
  notes: string | null;
  recorded_at: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  taken_at: string;
  notes: string | null;
}

export const FunctionalHealthDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMetric, setNewMetric] = useState({
    metric_type: "",
    value_numeric: "",
    systolic: "",
    diastolic: "",
    unit: "",
    notes: "",
  });

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
    start_date: "",
    end_date: "",
  });

  const metricTypes = [
    { value: "blood_pressure", label: "Blood Pressure", icon: Heart, unit: "mmHg" },
    { value: "heart_rate", label: "Heart Rate", icon: Activity, unit: "bpm" },
    { value: "temperature", label: "Temperature", icon: Thermometer, unit: "°F" },
    { value: "weight", label: "Weight", icon: Scale, unit: "lbs" },
    { value: "blood_sugar", label: "Blood Sugar", icon: Activity, unit: "mg/dL" },
    { value: "oxygen_saturation", label: "Oxygen Saturation", icon: Activity, unit: "%" },
  ];

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user]);

  const fetchHealthData = async () => {
    if (!user) return;

    try {
      // Fetch health metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(10);

      if (metricsError) throw metricsError;

      // Fetch medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (medicationsError) throw medicationsError;

      // Fetch medication logs
      const { data: logsData, error: logsError } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setHealthMetrics(metricsData || []);
      setMedications(medicationsData || []);
      setMedicationLogs(logsData || []);
    } catch (error) {
      console.error("Error fetching health data:", error);
      toast({
        title: "Error",
        description: "Failed to load health data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addHealthMetric = async () => {
    if (!user || !newMetric.metric_type) return;

    try {
      const metricData: any = {
        user_id: user.id,
        metric_type: newMetric.metric_type,
        unit: newMetric.unit,
        notes: newMetric.notes || null,
      };

      if (newMetric.metric_type === "blood_pressure") {
        metricData.systolic = parseFloat(newMetric.systolic);
        metricData.diastolic = parseFloat(newMetric.diastolic);
      } else {
        metricData.value_numeric = parseFloat(newMetric.value_numeric);
      }

      const { error } = await supabase.from("health_metrics").insert([metricData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health metric recorded successfully",
      });

      setNewMetric({
        metric_type: "",
        value_numeric: "",
        systolic: "",
        diastolic: "",
        unit: "",
        notes: "",
      });

      fetchHealthData();
    } catch (error) {
      console.error("Error adding health metric:", error);
      toast({
        title: "Error",
        description: "Failed to record health metric",
        variant: "destructive",
      });
    }
  };

  const addMedication = async () => {
    if (!user || !newMedication.name) return;

    try {
      const { error } = await supabase.from("medications").insert([
        {
          user_id: user.id,
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          instructions: newMedication.instructions || null,
          start_date: newMedication.start_date,
          end_date: newMedication.end_date || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication added successfully",
      });

      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        instructions: "",
        start_date: "",
        end_date: "",
      });

      fetchHealthData();
    } catch (error) {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      });
    }
  };

  const logMedication = async (medicationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("medication_logs").insert([
        {
          medication_id: medicationId,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication logged successfully",
      });

      fetchHealthData();
    } catch (error) {
      console.error("Error logging medication:", error);
      toast({
        title: "Error",
        description: "Failed to log medication",
        variant: "destructive",
      });
    }
  };

  const getLatestMetricValue = (type: string) => {
    const latest = healthMetrics.find((m) => m.metric_type === type);
    if (!latest) return null;

    if (type === "blood_pressure") {
      return `${latest.systolic}/${latest.diastolic}`;
    }
    return latest.value_numeric;
  };

  const isMedicationTakenToday = (medicationId: string) => {
    const today = new Date().toDateString();
    return medicationLogs.some(
      (log) =>
        log.medication_id === medicationId &&
        new Date(log.taken_at).toDateString() === today
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {profile?.full_name ? `${profile.full_name.split(' ')[0]}'s Health Dashboard` : 'Health Dashboard'}
          </h2>
          <p className="text-muted-foreground">Track your health metrics and medications</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="medical" size="sm">
                <Plus className="h-4 w-4" />
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Health Metric</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Metric Type</Label>
                  <Select
                    value={newMetric.metric_type}
                    onValueChange={(value) =>
                      setNewMetric({ ...newMetric, metric_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric type" />
                    </SelectTrigger>
                    <SelectContent>
                      {metricTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newMetric.metric_type === "blood_pressure" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Systolic</Label>
                      <Input
                        type="number"
                        placeholder="120"
                        value={newMetric.systolic}
                        onChange={(e) =>
                          setNewMetric({ ...newMetric, systolic: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Diastolic</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={newMetric.diastolic}
                        onChange={(e) =>
                          setNewMetric({ ...newMetric, diastolic: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={newMetric.value_numeric}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, value_numeric: e.target.value })
                      }
                    />
                  </div>
                )}

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional notes..."
                    value={newMetric.notes}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, notes: e.target.value })
                    }
                  />
                </div>

                <Button onClick={addHealthMetric} className="w-full">
                  Add Metric
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Pill className="h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Medication Name</Label>
                  <Input
                    placeholder="e.g., Lisinopril"
                    value={newMedication.name}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input
                    placeholder="e.g., 10mg"
                    value={newMedication.dosage}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, dosage: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Input
                    placeholder="e.g., Once daily"
                    value={newMedication.frequency}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, frequency: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newMedication.start_date}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, start_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Instructions (Optional)</Label>
                  <Textarea
                    placeholder="e.g., Take with food"
                    value={newMedication.instructions}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, instructions: e.target.value })
                    }
                  />
                </div>
                <Button onClick={addMedication} className="w-full">
                  Add Medication
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricTypes.map((metricType) => {
          const IconComponent = metricType.icon;
          const latestValue = getLatestMetricValue(metricType.value);
          const hasData = latestValue !== null;

          return (
            <Card key={metricType.value} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {metricType.label}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {hasData ? `${latestValue} ${metricType.unit}` : "No data"}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {hasData ? (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(
                          new Date(
                            healthMetrics.find((m) => m.metric_type === metricType.value)
                              ?.recorded_at || ""
                          ),
                          "MMM d, h:mm a"
                        )}
                      </span>
                    </>
                  ) : (
                    <span>Add your first reading</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Medications */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Pill className="h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medications added yet. Add your first medication to start tracking.
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((medication) => {
                const takenToday = isMedicationTakenToday(medication.id);
                return (
                  <div
                    key={medication.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {medication.name}
                        </h3>
                        <Badge variant={takenToday ? "default" : "outline"}>
                          {takenToday ? "Taken Today" : "Not Taken"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} • {medication.frequency}
                      </p>
                      {medication.instructions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {medication.instructions}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={takenToday ? "outline" : "medical"}
                      onClick={() => logMedication(medication.id)}
                      disabled={takenToday}
                    >
                      {takenToday ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {takenToday ? "Taken" : "Mark Taken"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};