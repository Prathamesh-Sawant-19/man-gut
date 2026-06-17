import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nvptwezhkjwybzynxvdp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cHR3ZWpra3p3eWJ6eW54dmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDk0NDYsImV4cCI6MjA1MjQyNTQ0Nn0.5i2-8GcWzP3rO2d16TQO2pMm71UeJ19lC2z8k39sQw'
export const supabase = createClient(supabaseUrl, supabaseKey)


