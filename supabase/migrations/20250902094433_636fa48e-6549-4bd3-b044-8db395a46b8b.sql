-- Create forum posts table for Community Health Forum
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vaccination records table
CREATE TABLE public.vaccination_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vaccine_name TEXT NOT NULL,
  date_administered DATE NOT NULL,
  next_due_date DATE,
  healthcare_provider TEXT,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chronic disease plans table
CREATE TABLE public.chronic_disease_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  condition_name TEXT NOT NULL,
  diagnosis_date DATE,
  severity TEXT,
  treatment_plan TEXT,
  goals TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create disease surveillance reports table
CREATE TABLE public.surveillance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  disease_type TEXT NOT NULL,
  symptoms TEXT[],
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_name TEXT,
  severity TEXT NOT NULL DEFAULT 'mild',
  is_confirmed BOOLEAN DEFAULT false,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency contacts table (separate from profiles for multiple contacts)
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chronic_disease_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveillance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_posts
CREATE POLICY "Everyone can view forum posts" 
ON public.forum_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.forum_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.forum_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.forum_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for forum_comments
CREATE POLICY "Everyone can view forum comments" 
ON public.forum_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.forum_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.forum_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.forum_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for vaccination_records
CREATE POLICY "Users can view their own vaccination records" 
ON public.vaccination_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaccination records" 
ON public.vaccination_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccination records" 
ON public.vaccination_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccination records" 
ON public.vaccination_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for chronic_disease_plans
CREATE POLICY "Users can view their own chronic disease plans" 
ON public.chronic_disease_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chronic disease plans" 
ON public.chronic_disease_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chronic disease plans" 
ON public.chronic_disease_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chronic disease plans" 
ON public.chronic_disease_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for surveillance_reports (public data for health authorities)
CREATE POLICY "Everyone can view surveillance reports" 
ON public.surveillance_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create surveillance reports" 
ON public.surveillance_reports 
FOR INSERT 
WITH CHECK ((user_id IS NULL) OR (auth.uid() = user_id));

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts" 
ON public.emergency_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts" 
ON public.emergency_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccination_records_updated_at
BEFORE UPDATE ON public.vaccination_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chronic_disease_plans_updated_at
BEFORE UPDATE ON public.chronic_disease_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();