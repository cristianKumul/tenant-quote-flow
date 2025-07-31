-- Create collects table for partial payments
CREATE TABLE public.collects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  notes TEXT,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint to quotes table
ALTER TABLE public.collects 
ADD CONSTRAINT fk_collects_quote_id 
FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.collects ENABLE ROW LEVEL SECURITY;

-- Create policies for collects (users can only manage collects for their own quotes)
CREATE POLICY "Users can view collects for their quotes" 
ON public.collects 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quotes 
  WHERE quotes.id = collects.quote_id 
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can create collects for their quotes" 
ON public.collects 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.quotes 
    WHERE quotes.id = collects.quote_id 
    AND quotes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update collects for their quotes" 
ON public.collects 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.quotes 
  WHERE quotes.id = collects.quote_id 
  AND quotes.user_id = auth.uid()
));

CREATE POLICY "Users can delete collects for their quotes" 
ON public.collects 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.quotes 
  WHERE quotes.id = collects.quote_id 
  AND quotes.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_collects_updated_at
  BEFORE UPDATE ON public.collects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();