-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_type text CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_conditions text[],
  allergies text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create health metrics table
CREATE TABLE public.health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'blood_sugar', 'oxygen_saturation')),
  value_numeric numeric,
  value_text text,
  unit text,
  systolic numeric, -- For blood pressure
  diastolic numeric, -- For blood pressure
  notes text,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create medications table
CREATE TABLE public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  instructions text,
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create medication logs table
CREATE TABLE public.medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  taken_at timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  qualifications text[],
  experience_years integer,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  location text,
  avatar_url text,
  consultation_fee numeric(10,2),
  is_available boolean DEFAULT true,
  available_hours jsonb, -- Store availability schedule
  languages text[],
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_type text NOT NULL CHECK (appointment_type IN ('video', 'phone', 'chat', 'in_person')),
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  symptoms text,
  notes text,
  prescription text,
  follow_up_required boolean DEFAULT false,
  meeting_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create chat messages table for AI assistant
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  content text NOT NULL,
  is_bot boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for health metrics
CREATE POLICY "Users can view their own health metrics" ON public.health_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics" ON public.health_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics" ON public.health_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health metrics" ON public.health_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for medications
CREATE POLICY "Users can view their own medications" ON public.medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications" ON public.medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications" ON public.medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications" ON public.medications
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for medication logs
CREATE POLICY "Users can view their own medication logs" ON public.medication_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs" ON public.medication_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for doctors (public read)
CREATE POLICY "Everyone can view doctors" ON public.doctors
  FOR SELECT USING (true);

-- Create RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat messages
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample doctors
INSERT INTO public.doctors (name, specialty, qualifications, experience_years, rating, location, consultation_fee, available_hours, languages, bio) VALUES
('Dr. Sarah Johnson', 'General Physician', ARRAY['MBBS', 'MD Internal Medicine'], 8, 4.8, 'New York, NY', 150.00, '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00"}', ARRAY['English', 'Spanish'], 'Experienced general physician specializing in preventive care and chronic disease management.'),
('Dr. Michael Chen', 'Cardiologist', ARRAY['MBBS', 'MD Cardiology', 'Fellowship in Interventional Cardiology'], 12, 4.9, 'Los Angeles, CA', 300.00, '{"monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00"}', ARRAY['English', 'Mandarin'], 'Board-certified cardiologist with expertise in heart disease prevention and treatment.'),
('Dr. Emily Rodriguez', 'Pediatrician', ARRAY['MBBS', 'MD Pediatrics'], 6, 4.7, 'Miami, FL', 120.00, '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00"}', ARRAY['English', 'Spanish'], 'Dedicated pediatrician focused on child health and development.'),
('Dr. James Wilson', 'Dermatologist', ARRAY['MBBS', 'MD Dermatology'], 10, 4.6, 'Chicago, IL', 200.00, '{"tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00"}', ARRAY['English'], 'Specialist in skin conditions, cosmetic dermatology, and skin cancer prevention.'),
('Dr. Lisa Thompson', 'Psychiatrist', ARRAY['MBBS', 'MD Psychiatry'], 15, 4.9, 'Seattle, WA', 250.00, '{"monday": "11:00-19:00", "tuesday": "11:00-19:00", "wednesday": "11:00-19:00", "thursday": "11:00-19:00"}', ARRAY['English'], 'Mental health specialist with focus on anxiety, depression, and stress management.');