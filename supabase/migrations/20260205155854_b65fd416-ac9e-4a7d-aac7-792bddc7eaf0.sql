-- Enable INSERT, UPDATE, DELETE policies for documents table
CREATE POLICY "Enable insert access for all users"
ON public.documents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON public.documents
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
ON public.documents
FOR DELETE
USING (true);

-- Enable INSERT, UPDATE, DELETE policies for projects table
CREATE POLICY "Enable insert access for all users"
ON public.projects
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON public.projects
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
ON public.projects
FOR DELETE
USING (true);