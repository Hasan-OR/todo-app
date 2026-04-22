import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ioriowfqskouxspnxjqv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvcmlvd2Zxc2tvdXhzcG54anF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDYyMjksImV4cCI6MjA5MTU4MjIyOX0.iAA3gl55d3i6ZDwo7HEOEqIXfmCoGFqNvB_1C6GexBc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
