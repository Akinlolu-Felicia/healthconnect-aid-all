import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Thermometer, 
  Weight, 
  Activity, 
  Calendar, 
  Pill, 
  TrendingUp,
  Clock
} from "lucide-react";

interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: "good" | "warning" | "danger";
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
}

const healthMetrics: HealthMetric[] = [
  {
    id: "1",
    name: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "good",
    trend: "stable",
    icon: Heart,
  },
  {
    id: "2",
    name: "Body Temperature",
    value: "98.6",
    unit: "°F",
    status: "good",
    trend: "stable",
    icon: Thermometer,
  },
  {
    id: "3",
    name: "Weight",
    value: "165",
    unit: "lbs",
    status: "good",
    trend: "down",
    icon: Weight,
  },
  {
    id: "4",
    name: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "good",
    trend: "stable",
    icon: Activity,
  },
];

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDue: string;
  taken: boolean;
}

const medications: Medication[] = [
  {
    id: "1",
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "Daily",
    nextDue: "9:00 AM",
    taken: true,
  },
  {
    id: "2",
    name: "Omega-3",
    dosage: "500mg",
    frequency: "Twice daily",
    nextDue: "2:00 PM",
    taken: false,
  },
  {
    id: "3",
    name: "Multivitamin",
    dosage: "1 tablet",
    frequency: "Daily",
    nextDue: "Tomorrow 8:00 AM",
    taken: true,
  },
];

export const HealthDashboard = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-success";
      case "warning": return "text-warning";
      case "danger": return "text-accent";
      default: return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↑";
      case "down": return "↓";
      case "stable": return "→";
      default: return "→";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Health Dashboard</h2>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          View History
        </Button>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.name}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <div className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  <span className={`text-sm ${getStatusColor(metric.status)} ml-auto`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                </div>
                <Badge 
                  variant={metric.status === "good" ? "default" : "secondary"}
                  className="mt-2"
                >
                  {metric.status === "good" ? "Normal" : 
                   metric.status === "warning" ? "Monitor" : "Alert"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Medication Tracker */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Pill className="h-5 w-5" />
            Medication Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.map((medication) => (
              <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    medication.taken ? "bg-success" : "bg-warning"
                  }`} />
                  <div>
                    <h4 className="font-medium text-foreground">{medication.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} • {medication.frequency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {medication.nextDue}
                  </div>
                  <Badge variant={medication.taken ? "default" : "secondary"} className="mt-1">
                    {medication.taken ? "Taken" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="text-foreground font-medium">67% Complete</span>
            </div>
            <Progress value={67} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs">Add Vitals</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Pill className="h-6 w-6" />
              <span className="text-xs">Log Medication</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Book Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Heart className="h-6 w-6" />
              <span className="text-xs">Health Tips</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};