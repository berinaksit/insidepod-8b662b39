-- Drop the overly permissive policies that override the restrictive owner-scoped policies
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.documents;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.documents;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.documents;