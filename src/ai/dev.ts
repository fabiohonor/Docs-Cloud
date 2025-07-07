
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env') });

import '@/ai/flows/summarize-technical-details.ts';
import '@/ai/flows/generate-report-draft.ts';
