import { config } from 'dotenv';
import path from 'path';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Tenta carregar as variáveis de ambiente do arquivo .env na raiz do projeto
config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("A variável de ambiente GOOGLE_API_KEY não está definida. Para obter uma chave de API, visite https://makersuite.google.com/ e adicione-a ao seu arquivo .env na raiz do projeto.");
}

export const ai = genkit({
  plugins: [googleAI({apiKey})],
});
