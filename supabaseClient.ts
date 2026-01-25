
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// URL from user configuration
const supabaseUrl = 'https://hwnsnuebyqanxjaibcne.supabase.co';

// API KEY from user configuration
const supabaseKey = 'sb_publishable_hy-j22xqkCAbhi6XLVJ-TQ_zIXNyAO-'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
