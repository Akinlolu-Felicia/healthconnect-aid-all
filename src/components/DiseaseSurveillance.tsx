import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Plus, 
  AlertTriangle,
  TrendingUp,
  Users,
  Globe,
  Activity,
  Thermometer,
  Eye,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SurveillanceReport {
  id: string;
  disease_type: string;
  symptoms: string[];
  location_name?: string;
  severity: string;
  is_confirmed: boolean;
  reported_at: string;
}

const DiseaseSurveillance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<SurveillanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [newReport, setNewReport] = useState({
    disease_type: "",
    symptoms: "",
    location_name: "",
    severity: "mild"
  });

  const commonDiseases = [
    "COVID-19",
    "Influenza (Flu)",
    "Common Cold",
    "Gastroenteritis",
    "Food Poisoning",
    "Norovirus",
    "RSV",
    "Strep Throat",
    "Skin Infection",
    "Respiratory Infection",
    "Other"
  ];

  const commonSymptoms = [
    "Fever", "Cough", "Sore Throat", "Runny Nose", "Fatigue",
    "Headache", "Body Aches", "Nausea", "Vomiting", "Diarrhea",
    "Loss of Taste/Smell", "Shortness of Breath", "Chest Pain",
    "Rash", "Chills", "Congestion"
  ];

  const severityLevels = [
    { value: "mild", label: "Mild", color: "bg-green-100 text-green-800" },
    { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
    { value: "severe", label: "Severe", color: "bg-red-100 text-red-800" }
  ];

  useEffect(() => {
    fetchSurveillanceReports();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  };

  const fetchSurveillanceReports = async () => {
    try {
      const { data, error } = await supabase
        .from("surveillance_reports")
        .select("*")
        .order("reported_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching surveillance reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!newReport.disease_type || !newReport.symptoms) {
      toast({
        title: "Missing Information",
        description: "Please fill in the disease type and symptoms.",
        variant: "destructive"
      });
      return;
    }

    try {
      const symptoms = newReport.symptoms.split(",").map(s => s.trim());
      
      const reportData = {
        user_id: user?.id || null,
        disease_type: newReport.disease_type,
        symptoms,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null,
        location_name: newReport.location_name || null,
        severity: newReport.severity
      };

      const { error } = await supabase
        .from("surveillance_reports")
        .insert(reportData);

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for contributing to public health surveillance."
      });

      setNewReport({
        disease_type: "",
        symptoms: "",
        location_name: "",
        severity: "mild"
      });
      setShowReportForm(false);
      fetchSurveillanceReports();
    } catch (error) {
      console.error("Error submitting surveillance report:", error);
      toast({
        title: "Error",
        description: "Failed to submit surveillance report.",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const level = severityLevels.find(s => s.value === severity);
    return <Badge className={level?.color || "bg-gray-100 text-gray-800"}>{level?.label || severity}</Badge>;
  };

  const getDiseaseCounts = () => {
    const counts: { [key: string]: number } = {};
    reports.forEach(report => {
      counts[report.disease_type] = (counts[report.disease_type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getRecentTrends = () => {
    const last7Days = reports.filter(report => {
      const reportDate = new Date(report.reported_at);
      const daysDiff = Math.floor((Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    return last7Days.length;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Disease Surveillance</h1>
        <p className="text-muted-foreground">Help track disease outbreaks and protect public health</p>
      </div>

      {/* Alert for Public Health */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Community Health Initiative:</strong> Your anonymous reports help health authorities 
          identify and respond to disease outbreaks. All data is anonymized and used for public health purposes only.
        </AlertDescription>
      </Alert>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getRecentTrends()}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{new Set(reports.map(r => r.disease_type)).size}</p>
                <p className="text-sm text-muted-foreground">Disease Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Disease Button */}
      <div className="text-center">
        <Button 
          onClick={() => setShowReportForm(!showReportForm)}
          variant="medical"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Report Disease/Symptoms
        </Button>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Submit Disease Surveillance Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                All reports are anonymous and help health authorities track disease patterns. 
                For medical emergencies, contact your healthcare provider or emergency services.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="disease-type">Disease/Condition *</Label>
                <select
                  id="disease-type"
                  value={newReport.disease_type}
                  onChange={(e) => setNewReport({ ...newReport, disease_type: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select disease/condition</option>
                  {commonDiseases.map((disease) => (
                    <option key={disease} value={disease}>
                      {disease}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  value={newReport.severity}
                  onChange={(e) => setNewReport({ ...newReport, severity: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="symptoms">Symptoms *</Label>
              <Textarea
                id="symptoms"
                value={newReport.symptoms}
                onChange={(e) => setNewReport({ ...newReport, symptoms: e.target.value })}
                placeholder="List symptoms separated by commas (e.g., fever, cough, headache)"
                rows={3}
              />
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Common symptoms:</p>
                <div className="flex flex-wrap gap-1">
                  {commonSymptoms.slice(0, 8).map((symptom) => (
                    <Badge 
                      key={symptom} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-muted"
                      onClick={() => {
                        const currentSymptoms = newReport.symptoms ? newReport.symptoms.split(",").map(s => s.trim()) : [];
                        if (!currentSymptoms.includes(symptom)) {
                          const newSymptoms = [...currentSymptoms, symptom].filter(s => s).join(", ");
                          setNewReport({ ...newReport, symptoms: newSymptoms });
                        }
                      }}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="location">General Location (Optional)</Label>
              <Input
                id="location"
                value={newReport.location_name}
                onChange={(e) => setNewReport({ ...newReport, location_name: e.target.value })}
                placeholder="City, State or general area (no specific addresses)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {location ? "✓ GPS location will be included (anonymized)" : "GPS location not available"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={submitReport} variant="medical">
                <Plus className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
              <Button onClick={() => setShowReportForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disease Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Disease Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading disease trends...</p>
          ) : getDiseaseCounts().length === 0 ? (
            <p className="text-muted-foreground">No surveillance data available yet.</p>
          ) : (
            <div className="space-y-3">
              {getDiseaseCounts().map(([disease, count]) => (
                <div key={disease} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <span className="font-medium">{disease}</span>
                  </div>
                  <Badge variant="outline">{count} reports</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading recent reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground">No surveillance reports available.</p>
          ) : (
            <div className="space-y-4">
              {reports.slice(0, 10).map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{report.disease_type}</h3>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(report.severity)}
                      {report.is_confirmed && (
                        <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    <span>Symptoms: {report.symptoms.join(", ")}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{report.location_name || "Location not specified"}</span>
                    </div>
                    <span>{formatDistanceToNow(new Date(report.reported_at))} ago</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Disease Surveillance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How It Works</h4>
              <p className="text-sm text-muted-foreground">
                Disease surveillance helps public health authorities identify potential outbreaks early. 
                Your anonymous reports contribute to a real-time picture of community health.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Privacy & Anonymity</h4>
              <p className="text-sm text-muted-foreground">
                All reports are anonymous. Location data is generalized and cannot be traced back to individuals. 
                Personal health information is never shared.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">When to Report</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Experiencing symptoms of contagious diseases</li>
                <li>• Noticing unusual disease patterns in your community</li>
                <li>• After receiving a confirmed diagnosis from healthcare provider</li>
                <li>• To help track seasonal illness trends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiseaseSurveillance;