import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Ambulance, 
  Shield,
  Heart,
  Brain
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: "emergency" | "hospital" | "personal";
  distance?: string;
  available: boolean;
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "Emergency Services",
    number: "911",
    type: "emergency",
    available: true,
  },
  {
    id: "2",
    name: "City General Hospital",
    number: "(555) 123-4567",
    type: "hospital",
    distance: "2.1 km",
    available: true,
  },
  {
    id: "3",
    name: "Poison Control",
    number: "1-800-222-1222",
    type: "emergency",
    available: true,
  },
  {
    id: "4",
    name: "Emergency Contact - Mom",
    number: "(555) 987-6543",
    type: "personal",
    available: true,
  },
];

interface EmergencyService {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  action: string;
}

const emergencyServices: EmergencyService[] = [
  {
    id: "1",
    name: "Ambulance",
    description: "Request immediate medical transport",
    icon: Ambulance,
    action: "Call Ambulance",
  },
  {
    id: "2",
    name: "Mental Health Crisis",
    description: "24/7 mental health support",
    icon: Brain,
    action: "Get Support",
  },
  {
    id: "3",
    name: "Cardiac Emergency",
    description: "Heart attack or chest pain",
    icon: Heart,
    action: "Cardiac Alert",
  },
];

export const EmergencySupport = () => {
  const [sosActivated, setSosActivated] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState<number | null>(null);

  const handleSOS = () => {
    setSosActivated(true);
    // Simulate emergency countdown
    let countdown = 10;
    setEmergencyTimer(countdown);
    
    const timer = setInterval(() => {
      countdown -= 1;
      setEmergencyTimer(countdown);
      
      if (countdown <= 0) {
        clearInterval(timer);
        // Simulate emergency call
        alert("Emergency services have been contacted! Help is on the way.");
        setSosActivated(false);
        setEmergencyTimer(null);
      }
    }, 1000);
  };

  const cancelSOS = () => {
    setSosActivated(false);
    setEmergencyTimer(null);
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    alert(`Calling ${contact.name} at ${contact.number}`);
  };

  const handleEmergencyService = (service: EmergencyService) => {
    alert(`Initiating ${service.name} service`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Emergency Support</h2>
        <p className="text-muted-foreground">Immediate help when you need it most</p>
      </div>

      {/* SOS Button */}
      <Card className="shadow-lg border-2 border-accent">
        <CardContent className="p-8 text-center">
          {!sosActivated ? (
            <div className="space-y-4">
              <AlertTriangle className="h-16 w-16 text-accent mx-auto" />
              <h3 className="text-xl font-bold text-foreground">Emergency SOS</h3>
              <p className="text-muted-foreground">
                Press and hold for 3 seconds to alert emergency services and your emergency contacts
              </p>
              <Button
                variant="emergency"
                size="lg"
                onClick={handleSOS}
                className="h-20 w-20 rounded-full text-lg font-bold"
              >
                SOS
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent-foreground">
                      {emergencyTimer}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-accent animate-ping"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-accent">Emergency Alert Active</h3>
              <p className="text-muted-foreground">
                Emergency services will be contacted in {emergencyTimer} seconds
              </p>
              <Button
                variant="outline"
                onClick={cancelSOS}
                className="bg-background"
              >
                Cancel Emergency Alert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Services */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5" />
            Emergency Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {emergencyServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="emergency"
                    onClick={() => handleEmergencyService(service)}
                  >
                    {service.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    contact.available ? "bg-success" : "bg-muted"
                  }`} />
                  <div>
                    <h4 className="font-medium text-foreground">{contact.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{contact.number}</span>
                      {contact.distance && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{contact.distance}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={contact.type === "emergency" ? "default" : "secondary"}>
                    {contact.type}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmergencyCall(contact)}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Sharing */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5" />
            Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Share your location</h4>
              <p className="text-sm text-muted-foreground">
                Allow emergency contacts to see your location during emergencies
              </p>
            </div>
            <Button variant="outline">
              Enable Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};