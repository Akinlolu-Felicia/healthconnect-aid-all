import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  medical_conditions: string[] | null;
  allergies: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  avatar_url: string | null;
}

export const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    medical_conditions: "",
    allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          blood_type: data.blood_type || "",
          medical_conditions: data.medical_conditions?.join(", ") || "",
          allergies: data.allergies?.join(", ") || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      const profileData = {
        user_id: user.id,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        blood_type: formData.blood_type || null,
        medical_conditions: formData.medical_conditions
          ? formData.medical_conditions.split(",").map(s => s.trim()).filter(s => s)
          : null,
        allergies: formData.allergies
          ? formData.allergies.split(",").map(s => s.trim()).filter(s => s)
          : null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert([profileData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Profile</h2>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>
        <Button
          variant={isEditing ? "outline" : "medical"}
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
              setFormData({
                full_name: profile?.full_name || "",
                phone: profile?.phone || "",
                date_of_birth: profile?.date_of_birth || "",
                gender: profile?.gender || "",
                blood_type: profile?.blood_type || "",
                medical_conditions: profile?.medical_conditions?.join(", ") || "",
                allergies: profile?.allergies?.join(", ") || "",
                emergency_contact_name: profile?.emergency_contact_name || "",
                emergency_contact_phone: profile?.emergency_contact_phone || "",
              });
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-foreground">{profile?.full_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-foreground">{profile?.phone || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Date of Birth</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              ) : (
                <p className="text-foreground">{profile?.date_of_birth || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Gender</Label>
              {isEditing ? (
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground">{profile?.gender || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Blood Type</Label>
              {isEditing ? (
                <Select value={formData.blood_type} onValueChange={(value) => setFormData({ ...formData, blood_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground">{profile?.blood_type || "Not provided"}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Medical Conditions</Label>
            {isEditing ? (
              <Textarea
                value={formData.medical_conditions}
                onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                placeholder="Enter medical conditions separated by commas"
              />
            ) : (
              <p className="text-foreground">{profile?.medical_conditions?.join(", ") || "None"}</p>
            )}
          </div>

          <div>
            <Label>Allergies</Label>
            {isEditing ? (
              <Textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Enter allergies separated by commas"
              />
            ) : (
              <p className="text-foreground">{profile?.allergies?.join(", ") || "None"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contact Name</Label>
              {isEditing ? (
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Emergency contact name"
                />
              ) : (
                <p className="text-foreground">{profile?.emergency_contact_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Contact Phone</Label>
              {isEditing ? (
                <Input
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="Emergency contact phone"
                />
              ) : (
                <p className="text-foreground">{profile?.emergency_contact_phone || "Not provided"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <Button onClick={saveProfile} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};