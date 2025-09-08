import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Calendar,
  User,
  Award,
  Languages,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { PaymentIntegration } from "./PaymentIntegration";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string[];
  experience_years: number;
  rating: number;
  location: string;
  avatar_url: string | null;
  consultation_fee: number;
  is_available: boolean;
  available_hours: any;
  languages: string[];
  bio: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_type: "video" | "phone" | "chat" | "in_person";
  scheduled_at: string;
  symptoms: string;
  notes: string;
  status: string;
}

export const FunctionalDoctorDirectory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentData, setAppointmentData] = useState({
    appointment_type: "video" as "video" | "phone" | "chat" | "in_person",
    scheduled_at: "",
    symptoms: "",
    notes: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [doctors, searchTerm]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_available", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!user || !selectedDoctor) return;

    try {
      const { error } = await supabase.from("appointments").insert([
        {
          user_id: user.id,
          doctor_id: selectedDoctor.id,
          appointment_type: appointmentData.appointment_type,
          scheduled_at: appointmentData.scheduled_at,
          symptoms: appointmentData.symptoms,
          notes: appointmentData.notes,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${appointmentData.appointment_type} consultation with Dr. ${selectedDoctor.name} has been booked!`,
      });

      setSelectedDoctor(null);
      setAppointmentData({
        appointment_type: "video",
        scheduled_at: "",
        symptoms: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "chat":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getAvailableTimeSlots = () => {
    const slots = [];
    const tomorrow = addDays(new Date(), 1);
    
    // Generate time slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = addDays(tomorrow, i);
      const dayName = format(date, "EEEE").toLowerCase();
      
      // Basic available hours (9 AM to 5 PM)
      for (let hour = 9; hour <= 17; hour++) {
        const timeSlot = new Date(date);
        timeSlot.setHours(hour, 0, 0, 0);
        
        slots.push({
          value: timeSlot.toISOString(),
          label: format(timeSlot, "MMM d, yyyy 'at' h:mm a"),
        });
      }
    }
    
    return slots;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Find Doctors</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No doctors found matching your search." : "No doctors available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={doctor.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-foreground truncate">
                      {doctor.name}
                    </CardTitle>
                    <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {doctor.rating} ({doctor.experience_years} years exp.)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{doctor.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>${doctor.consultation_fee} consultation</span>
                  </div>

                  {doctor.languages && doctor.languages.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Languages className="h-4 w-4" />
                      <span>{doctor.languages.join(", ")}</span>
                    </div>
                  )}

                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doctor.qualifications.slice(0, 2).map((qual, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                      {doctor.qualifications.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{doctor.qualifications.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {doctor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="medical"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <Calendar className="h-4 w-4" />
                          Book
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book Consultation</DialogTitle>
                        </DialogHeader>
                        {selectedDoctor && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={selectedDoctor.avatar_url || undefined} />
                                <AvatarFallback>
                                  <User className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{selectedDoctor.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {selectedDoctor.specialty}
                                </p>
                              </div>
                            </div>

                            <div>
                              <Label>Consultation Type</Label>
                              <Select
                                value={appointmentData.appointment_type}
                                onValueChange={(value: any) =>
                                  setAppointmentData({
                                    ...appointmentData,
                                    appointment_type: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">
                                    <div className="flex items-center space-x-2">
                                      <Video className="h-4 w-4" />
                                      <span>Video Call</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="phone">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4" />
                                      <span>Phone Call</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="chat">
                                    <div className="flex items-center space-x-2">
                                      <MessageCircle className="h-4 w-4" />
                                      <span>Chat</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Appointment Time</Label>
                              <Select
                                value={appointmentData.scheduled_at}
                                onValueChange={(value) =>
                                  setAppointmentData({
                                    ...appointmentData,
                                    scheduled_at: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableTimeSlots().map((slot) => (
                                    <SelectItem key={slot.value} value={slot.value}>
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Symptoms/Reason for Visit</Label>
                              <Textarea
                                placeholder="Describe your symptoms or reason for consultation..."
                                value={appointmentData.symptoms}
                                onChange={(e) =>
                                  setAppointmentData({
                                    ...appointmentData,
                                    symptoms: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <Label>Additional Notes (Optional)</Label>
                              <Textarea
                                placeholder="Any additional information..."
                                value={appointmentData.notes}
                                onChange={(e) =>
                                  setAppointmentData({
                                    ...appointmentData,
                                    notes: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                              <PaymentIntegration
                                appointmentId="temp-id"
                                amount={selectedDoctor.consultation_fee}
                                doctorName={selectedDoctor.name}
                                onPaymentSuccess={() => {
                                  if (appointmentData.scheduled_at && appointmentData.symptoms) {
                                    bookAppointment();
                                  }
                                }}
                              />
                              <Button
                                onClick={bookAppointment}
                                disabled={!appointmentData.scheduled_at || !appointmentData.symptoms}
                                variant="outline"
                                className="w-full"
                              >
                                Book Without Payment
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};