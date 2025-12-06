import 'dotenv/config';

export const PORT = process.env.PORT || 8080;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	throw new Error('Missing Supabase env vars');
}
