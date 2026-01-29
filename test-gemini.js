const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `You are a tax policy expert. Provide tax rate for United States.
    
Return ONLY valid JSON with no markdown:
{
  "effectiveRate": 0.25,
  "description": "Test"
}`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Error details:');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', JSON.stringify(error.errorDetails, null, 2));
  }
}

test();
