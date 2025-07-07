
import { config } from 'dotenv';
import path from 'path';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Força o carregamento do arquivo .env da raiz do projeto.
// Isso é uma salvaguarda, já que o Next.js deveria fazer isso automaticamente.
config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  // Constrói uma mensagem de erro detalhada para depuração.
  const allEnvKeys = Object.keys(process.env);
  const similarKeys = allEnvKeys.filter(k => k.toUpperCase().includes('GOOGLE') || k.toUpperCase().includes('API'));
  
  let errorMessage = "A variável de ambiente GOOGLE_API_KEY não está definida. A conexão com a IA falhou.\n\n";
  errorMessage += "--- GUIA DE DIAGNÓSTICO ---\n";
  errorMessage += "1. ARQUIVO .env: Verifique se existe um arquivo chamado `.env` (com o ponto no início) na pasta principal do seu projeto (a mesma pasta que o `package.json`).\n";
  errorMessage += "2. NOME DA CHAVE: Dentro do `.env`, a linha DEVE ser exatamente `GOOGLE_API_KEY=\"sua_chave_aqui\"`. Verifique se não há erros de digitação ou espaços extras.\n";
  errorMessage += "3. REINICIALIZAÇÃO: Após qualquer alteração no `.env`, você DEVE reiniciar o servidor de desenvolvimento (Ctrl+C e `npm run dev`).\n\n";
  errorMessage += "--- INFORMAÇÕES DE DEPURAÇÃO ---\n";
  errorMessage += `Caminho atual do processo (deve ser a raiz do projeto): ${process.cwd()}\n`;
  if (similarKeys.length > 0) {
    errorMessage += `Variáveis de ambiente parecidas foram encontradas: [${similarKeys.join(', ')}]. Verificou se há erro de digitação?`;
  } else {
    errorMessage += "Nenhuma variável de ambiente contendo 'GOOGLE' ou 'API' foi encontrada. O arquivo .env pode não ter sido carregado.";
  }

  throw new Error(errorMessage);
}

export const ai = genkit({
  plugins: [googleAI({apiKey})],
});
