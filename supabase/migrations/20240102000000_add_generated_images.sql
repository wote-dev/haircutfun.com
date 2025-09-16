-- Create generated_images table to store user-generated hairstyle images
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    original_image_url TEXT,
    haircut_style TEXT NOT NULL,
    gender TEXT,
    prompt_used TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON public.generated_images(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_images_haircut_style ON public.generated_images(haircut_style);

-- Enable Row Level Security
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for generated_images
CREATE POLICY "Users can view own generated images" ON public.generated_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated images" ON public.generated_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated images" ON public.generated_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated images" ON public.generated_images
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_generated_images_updated_at
    BEFORE UPDATE ON public.generated_images
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();