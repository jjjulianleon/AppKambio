const axios = require('axios');
require('dotenv').config();

// Load OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('⚠️  WARNING: OPENAI_API_KEY not found in environment variables');
}

const client = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds timeout for AI requests
});

/**
 * Generates a financial insight based on user transactions
 * @param {Array} transactions - List of transaction objects
 * @returns {Promise<string>} - The generated insight
 */
const generateFinancialInsight = async (transactions) => {
    try {
        // Simplify transactions for the prompt to save tokens
        const simplifiedTransactions = transactions.map(t => ({
            date: t.transaction_date, // Correct field name from Transaction model
            amount: t.amount,
            category: t.category || 'Sin categoría', // category is a direct string field
            description: t.description
        }));

        const prompt = `
      Analiza estos gastos de un usuario joven ecuatoriano que está en su camino de ahorro:
      ${JSON.stringify(simplifiedTransactions)}

      Tu objetivo es identificar patrones de consumo de forma POSITIVA y sugerir pequeñas mejoras sin juzgar.

      Estructura tu respuesta en 2-3 frases cortas:
      1. Reconoce algo positivo o interesante de sus hábitos (ej: "¡Qué buena onda que te cuidas con el transporte!")
      2. Sugiere UNA oportunidad de ahorro de forma amigable (ej: "Mira, si te haces el cafecito en casa en vez de comprarlo, podrías ahorrar como $15 al mes")
      3. Termina con ánimo para sus metas (ej: "¡Vas súper bien, sigue así y vas a cumplir tus metas!")

      Tono: Tu mejor amigo que te apoya. Usa jerga ecuatoriana muy suave y natural.
      Ejemplos de tono correcto:
      - "¡Qué crack! Vi que..."
      - "Mira, aquí va un dato..."
      - "¡Estás firme con tus metas!"
      - "Dale con todo, vas por buen camino"

      NUNCA uses tono de regaño, juicio o crítica. SIEMPRE enfócate en lo positivo primero.
      NUNCA uses frases como "bájale a", "demasiado", "mucho gasto", "deberías dejar de".
      SIEMPRE usa frases como "podrías ahorrar", "una idea sería", "qué tal si pruebas", "vas bien".
    `;

        const response = await client.post('/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres el mejor amigo y coach financiero de jóvenes ecuatorianos. Tu rol es MOTIVAR, APOYAR y DAR ÁNIMOS, nunca regañar ni criticar. Siempre encuentras algo positivo primero, luego sugieres mejoras de forma amigable. Eres como ese pana que siempre te impulsa a ser mejor pero con buena onda." },
                { role: "user", content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.8
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating insight:', error.response?.data || error.message);
        return "¡Pilas! Revisa tus gastos, parece que hubo un error al analizar tus datos, pero sigue ahorrando.";
    }
};

/**
 * Generates mock transactions for testing
 * @param {number} count - Number of transactions to generate
 * @returns {Promise<Array>} - List of generated transactions
 */
const generateMockTransactions = async (count = 50) => {
    try {
        const prompt = `
      Genera un JSON con ${count} transacciones simuladas para un joven ecuatoriano con muchos "gastos hormiga".
      
      IMPORTANTE: Incluye patrones de tiempo específicos. Por ejemplo:
      - Cafés o desayunos en la mañana (7am - 10am).
      - Almuerzos o snacks al mediodía.
      - Salidas, bielas o comida rápida en la noche (especialmente viernes/sábado).
      - Transporte (Uber) en horas pico o madrugada.

      Formato de respuesta esperado (Array de objetos JSON):
      [
        {
          "amount": 5.50,
          "description": "Salchipapas donde el vecino",
          "category": "Comida",
          "date": "2023-10-27T20:30:00", // Incluye HORA
          "type": "expense"
        }
      ]

      Reglas:
      - Montos entre $1.00 y $15.00 USD.
      - Categorías realistas: Transporte, Comida, Entretenimiento, Vicios, Servicios.
      - Descripciones variadas y creativas.
      - Solo devuelve el JSON válido, sin texto adicional.
    `;

        const response = await client.post('/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un generador de datos de prueba. Devuelve solo JSON válido." },
                { role: "user", content: prompt }
            ],
            temperature: 0.8
        });

        const content = response.data.choices[0].message.content;
        // Clean up markdown code blocks if present
        const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating mock data:', error.response?.data || error.message);
        // Fallback data if API fails
        return Array.from({ length: 5 }, (_, i) => ({
            amount: (Math.random() * 10 + 1).toFixed(2),
            description: "Gasto genérico de prueba",
            category: "Otros",
            date: new Date().toISOString(),
            type: "expense"
        }));
    }
};

module.exports = {
    generateFinancialInsight,
    generateMockTransactions
};
