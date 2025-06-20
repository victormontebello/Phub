-- 1. Create the new pet_images table
CREATE TABLE IF NOT EXISTS pet_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pet_images_pet_id ON pet_images(pet_id);

-- 3. Enable Row Level Security
ALTER TABLE pet_images ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for pet_images
-- Anyone can view images for available pets
CREATE POLICY "Anyone can read images for available pets"
  ON pet_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_images.pet_id AND pets.status = 'available'
    )
  );

-- Users can view images of their own pets regardless of status
CREATE POLICY "Users can view images of their own pets"
  ON pet_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_images.pet_id AND pets.seller_id = auth.uid()
    )
  );

-- Users can insert images for their own pets
CREATE POLICY "Users can insert images for own pets"
  ON pet_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_images.pet_id AND pets.seller_id = auth.uid()
    )
  );

-- Users can delete images from their own pets
CREATE POLICY "Users can delete images from own pets"
  ON pet_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_images.pet_id AND pets.seller_id = auth.uid()
    )
  );

-- 5. Create a new storage bucket for pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Create policies for the pet-images bucket
-- Allow anyone to view images
CREATE POLICY "Allow public read access to pet images"
  ON storage.objects FOR SELECT
  TO public
  USING ( bucket_id = 'pet-images' );

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload pet images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'pet-images' );

-- Allow owners to update their pet images
CREATE POLICY "Allow owners to update their pet images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( auth.uid()::text = owner_id );

-- Allow owners to delete their pet images
CREATE POLICY "Allow owners to delete their pet images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( auth.uid()::text = owner_id ); 