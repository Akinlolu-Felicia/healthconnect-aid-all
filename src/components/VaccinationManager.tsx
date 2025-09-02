import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Plus, 
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  Syringe,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface VaccinationRecord {
  id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date?: string;
  healthcare_provider?: string;
  batch_number?: string;
  notes?: string;
}

const VaccinationManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedNextDate, setSelectedNextDate] = useState<Date>();
  
  const [newRecord, setNewRecord] = useState({
    vaccine_name: "",
    date_administered: "",
    next_due_date: "",
    healthcare_provider: "",
    batch_number: "",
    notes: ""
  });

  const commonVaccines = [
    { name: "COVID-19", interval: 365 },
    { name: "Influenza (Flu)", interval: 365 },
    { name: "Tdap (Tetanus, Diphtheria, Pertussis)", interval: 3650 }, // 10 years
    { name: "MMR (Measles, Mumps, Rubella)", interval: null },
    { name: "Hepatitis B", interval: null },
    { name: "Pneumococcal", interval: 1825 }, // 5 years
    { name: "Shingles (Zoster)", interval: null },
    { name: "HPV", interval: null },
    { name: "Meningococcal", interval: 1825 }
  ];

  useEffect(() => {
    if (user) {
      fetchVaccinationRecords();
    }
  }, [user]);

  const fetchVaccinationRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("vaccination_records")
        .select("*")
        .eq("user_id", user?.id)
        .order("date_administered", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching vaccination records:", error);
    } finally {
      setLoading(false);
    }
  };

  const addVaccinationRecord = async () => {
    if (!newRecord.vaccine_name || !newRecord.date_administered) {
      toast({
        title: "Missing Information",
        description: "Please fill in the vaccine name and date administered.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("vaccination_records")
        .insert({
          user_id: user?.id,
          ...newRecord
        });

      if (error) throw error;

      toast({
        title: "Vaccination Record Added",
        description: "Your vaccination record has been saved successfully."
      });

      setNewRecord({
        vaccine_name: "",
        date_administered: "",
        next_due_date: "",
        healthcare_provider: "",
        batch_number: "",
        notes: ""
      });
      setSelectedDate(undefined);
      setSelectedNextDate(undefined);
      setShowAddForm(false);
      fetchVaccinationRecords();
    } catch (error) {
      console.error("Error adding vaccination record:", error);
      toast({
        title: "Error",
        description: "Failed to add vaccination record.",
        variant: "destructive"
      });
    }
  };

  const getVaccinationStatus = (record: VaccinationRecord) => {
    if (!record.next_due_date) return "completed";
    
    const nextDue = new Date(record.next_due_date);
    const today = new Date();
    const warningDate = addDays(today, 30); // 30 days warning

    if (isBefore(nextDue, today)) return "overdue";
    if (isBefore(nextDue, warningDate)) return "due-soon";
    return "up-to-date";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "due-soon":
        return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
      case "up-to-date":
        return <Badge className="bg-green-100 text-green-800">Up to Date</Badge>;
      default:
        return <Badge variant="outline">Completed</Badge>;
    }
  };

  const getUpcomingVaccinations = () => {
    return records.filter(record => {
      const status = getVaccinationStatus(record);
      return status === "overdue" || status === "due-soon";
    });
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Vaccination Management</h2>
        <p>Please sign in to manage your vaccination records.</p>
      </div>
    );
  }

  const upcomingVaccinations = getUpcomingVaccinations();

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Vaccination Management</h1>
        <p className="text-muted-foreground">Track your immunizations and stay protected</p>
      </div>

      {/* Upcoming Vaccinations Alert */}
      {upcomingVaccinations.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              Vaccination Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingVaccinations.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="font-medium">{record.vaccine_name}</span>
                  <div className="flex items-center gap-2">
                    {record.next_due_date && (
                      <span className="text-sm text-muted-foreground">
                        Due: {format(new Date(record.next_due_date), "MMM dd, yyyy")}
                      </span>
                    )}
                    {getStatusBadge(getVaccinationStatus(record))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant="medical"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vaccination Record
        </Button>
      </div>

      {/* Add Vaccination Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Add Vaccination Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vaccine-name">Vaccine Name *</Label>
                <select
                  id="vaccine-name"
                  value={newRecord.vaccine_name}
                  onChange={(e) => setNewRecord({ ...newRecord, vaccine_name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select vaccine</option>
                  {commonVaccines.map((vaccine) => (
                    <option key={vaccine.name} value={vaccine.name}>
                      {vaccine.name}
                    </option>
                  ))}
                  <option value="other">Other (specify in notes)</option>
                </select>
              </div>

              <div>
                <Label>Date Administered *</Label>
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
                        setNewRecord({ 
                          ...newRecord, 
                          date_administered: date ? format(date, "yyyy-MM-dd") : "" 
                        });
                      }}
                      disabled={(date) => isAfter(date, new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Next Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {selectedNextDate ? format(selectedNextDate, "PPP") : "Select next due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedNextDate}
                      onSelect={(date) => {
                        setSelectedNextDate(date);
                        setNewRecord({ 
                          ...newRecord, 
                          next_due_date: date ? format(date, "yyyy-MM-dd") : "" 
                        });
                      }}
                      disabled={(date) => isBefore(date, new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="provider">Healthcare Provider</Label>
                <Input
                  id="provider"
                  value={newRecord.healthcare_provider}
                  onChange={(e) => setNewRecord({ ...newRecord, healthcare_provider: e.target.value })}
                  placeholder="Dr. Smith, City Clinic"
                />
              </div>

              <div>
                <Label htmlFor="batch">Batch/Lot Number</Label>
                <Input
                  id="batch"
                  value={newRecord.batch_number}
                  onChange={(e) => setNewRecord({ ...newRecord, batch_number: e.target.value })}
                  placeholder="Batch number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="Any additional notes about the vaccination..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addVaccinationRecord} variant="medical">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vaccination Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Vaccination Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading vaccination records...</p>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Syringe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vaccination records found.</p>
              <p>Add your first vaccination record to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg">{record.vaccine_name}</h3>
                    {getStatusBadge(getVaccinationStatus(record))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date Administered:</span>
                      <p className="font-medium">
                        {format(new Date(record.date_administered), "MMMM dd, yyyy")}
                      </p>
                    </div>
                    
                    {record.next_due_date && (
                      <div>
                        <span className="text-muted-foreground">Next Due:</span>
                        <p className="font-medium">
                          {format(new Date(record.next_due_date), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    )}
                    
                    {record.healthcare_provider && (
                      <div>
                        <span className="text-muted-foreground">Provider:</span>
                        <p className="font-medium">{record.healthcare_provider}</p>
                      </div>
                    )}
                    
                    {record.batch_number && (
                      <div>
                        <span className="text-muted-foreground">Batch Number:</span>
                        <p className="font-medium">{record.batch_number}</p>
                      </div>
                    )}
                  </div>
                  
                  {record.notes && (
                    <div className="mt-3">
                      <span className="text-muted-foreground text-sm">Notes:</span>
                      <p className="text-sm mt-1">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vaccination Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Why Track Vaccinations?</h4>
              <p className="text-sm text-muted-foreground">
                Keeping track of your vaccinations helps ensure you stay protected against preventable diseases 
                and helps healthcare providers make informed decisions about your care.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recommended Adult Vaccinations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Annual flu shot</li>
                <li>• COVID-19 vaccine (as recommended)</li>
                <li>• Tdap every 10 years</li>
                <li>• Pneumococcal vaccine (age 65+)</li>
                <li>• Shingles vaccine (age 50+)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaccinationManager;