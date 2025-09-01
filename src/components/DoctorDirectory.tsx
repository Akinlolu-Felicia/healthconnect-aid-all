import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Clock, Video, Phone, MessageCircle } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  distance: string;
  avatar: string;
  availability: string;
  consultationFee: string;
}

const sampleDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    rating: 4.8,
    experience: "12 years",
    location: "Central Hospital",
    distance: "2.3 km",
    avatar: "",
    availability: "Available now",
    consultationFee: "$45",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    rating: 4.9,
    experience: "15 years",
    location: "Heart Care Clinic",
    distance: "3.1 km",
    avatar: "",
    availability: "Next: 2:30 PM",
    consultationFee: "$80",
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    specialty: "Pediatrics",
    rating: 4.7,
    experience: "8 years",
    location: "Children's Health Center",
    distance: "1.8 km",
    avatar: "",
    availability: "Available now",
    consultationFee: "$55",
  },
];

export const DoctorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredDoctors = sampleDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookConsultation = (doctor: Doctor, type: 'video' | 'phone' | 'chat') => {
    // Simulate booking process
    alert(`Booking ${type} consultation with ${doctor.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Find a Doctor</h2>
        <Input
          placeholder="Search by doctor name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
                      <p className="text-muted-foreground">{doctor.specialty}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{doctor.experience} experience</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.location} • {doctor.distance}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant={doctor.availability.includes("Available") ? "default" : "secondary"}>
                        <Clock className="h-3 w-3 mr-1" />
                        {doctor.availability}
                      </Badge>
                      <span className="text-sm font-medium text-primary">{doctor.consultationFee}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleBookConsultation(doctor, 'video')}
                    variant="medical"
                    size="sm"
                    className="gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Video Call
                  </Button>
                  <Button
                    onClick={() => handleBookConsultation(doctor, 'phone')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Voice Call
                  </Button>
                  <Button
                    onClick={() => handleBookConsultation(doctor, 'chat')}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};