-- Update existing doctors to be Africa-based
UPDATE doctors SET 
  name = 'Dr. Adunni Okafor',
  specialty = 'General Physician',
  location = 'Lagos University Teaching Hospital, Nigeria',
  bio = 'Experienced general physician specializing in tropical diseases and preventive care in Nigeria.',
  languages = ARRAY['English', 'Yoruba', 'Igbo']
WHERE id = 'a831fe62-dc64-4bb8-9be0-a3484031b16f';

UPDATE doctors SET 
  name = 'Dr. Kwame Asante',
  specialty = 'Cardiologist', 
  location = 'Korle-Bu Teaching Hospital, Ghana',
  bio = 'Board-certified cardiologist with expertise in cardiovascular diseases common in West Africa.',
  languages = ARRAY['English', 'Twi']
WHERE id = 'b25c5f2e-357e-49bc-9e3b-c925365d491d';

UPDATE doctors SET 
  name = 'Dr. Amina Hassan', 
  specialty = 'Pediatrician',
  location = 'Chris Hani Baragwanath Hospital, South Africa',
  bio = 'Dedicated pediatrician focused on child nutrition and infectious diseases in Africa.',
  languages = ARRAY['English', 'Zulu', 'Afrikaans']
WHERE id = '9a037164-b222-485e-b72a-947690bb11ed';

UPDATE doctors SET 
  name = 'Dr. Fatou Diallo',
  specialty = 'Dermatologist',
  location = 'Hôpital Principal de Dakar, Senegal', 
  bio = 'Specialist in tropical skin conditions and dermatology for African skin types.',
  languages = ARRAY['French', 'Wolof', 'English']
WHERE id = 'acc0ae53-23a4-4e8a-af8b-eb1caf7b7601';

UPDATE doctors SET 
  name = 'Dr. Mwangi Kariuki',
  specialty = 'Psychiatrist',
  location = 'Kenyatta National Hospital, Kenya',
  bio = 'Mental health specialist focusing on community mental health and trauma care.',
  languages = ARRAY['English', 'Swahili', 'Kikuyu']
WHERE id = '9efbe742-5fc0-4097-9fa8-250824270ab9';

-- Add more African doctors
INSERT INTO doctors (
  name, specialty, qualifications, experience_years, rating, location, 
  consultation_fee, is_available, available_hours, languages, bio
) VALUES 
('Dr. Chinedu Okonkwo', 'Orthopedic Surgeon', ARRAY['MBBS', 'MS Orthopedics'], 14, 4.8, 
 'University of Nigeria Teaching Hospital, Enugu', 180.00, true,
 '{"monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-14:00"}',
 ARRAY['English', 'Igbo'], 'Specialist in bone and joint conditions common in Nigeria.'),

('Dr. Aisha Mahmoud', 'Gynecologist', ARRAY['MBBS', 'MD Obstetrics & Gynecology'], 11, 4.7,
 'Cairo University Hospital, Egypt', 160.00, true,
 '{"sunday": "9:00-17:00", "monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00"}',
 ARRAY['Arabic', 'English'], 'Women''s health specialist with focus on maternal care in Africa.'),

('Dr. Sipho Mthembu', 'Infectious Disease Specialist', ARRAY['MBBS', 'PhD Infectious Diseases'], 16, 4.9,
 'Groote Schuur Hospital, Cape Town, South Africa', 220.00, true,
 '{"monday": "7:00-15:00", "tuesday": "7:00-15:00", "wednesday": "7:00-15:00", "thursday": "7:00-15:00", "friday": "7:00-15:00"}',
 ARRAY['English', 'Zulu', 'Xhosa'], 'Expert in HIV/AIDS, tuberculosis, and tropical diseases.'),

('Dr. Mariam Traoré', 'Neurologist', ARRAY['MBBS', 'MD Neurology'], 9, 4.6,
 'Gabriel Touré Hospital, Bamako, Mali', 200.00, true,
 '{"monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-13:00"}',
 ARRAY['French', 'Bambara'], 'Neurological conditions specialist with focus on meningitis and stroke care.');