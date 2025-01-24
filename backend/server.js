import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/solve', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Ensure the image data has the correct format for Gemini API
    // Remove the data URL prefix if present and get just the base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    const prompt = 'Analyze this handwritten mathematical expression and provide only the numerical result. If it\'s an equation, solve for the unknown variable.';
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/png'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract numerical result from the response
    const numericResult = text.match(/\d+(\.\d+)?/)?.[0] || text;
    
    res.json({ result: numericResult });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});