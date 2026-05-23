const fs = require('fs');
const path = require('path');

const PROMPT = fs.readFileSync(
  path.join(__dirname, '..', 'utils', 'template-generation-prompt.txt'),
  'utf-8'
);

const EDITOR_PROMPT = fs.readFileSync(
  path.join(__dirname, '..', 'utils', 'image-generator-prompt.txt'),
  'utf-8'
);

const generateMemeTemplates = async (req, res) => {
  try {
    const { image } = req.body; // base64 data URL e.g. "data:image/png;base64,..."

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || process.env.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Failed to generate meme templates',
        details: errorData,
      });
    }

    const data = await response.json();
    console.log('OpenRouter Templates Response Data:', JSON.stringify(data, null, 2));
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content in AI response', raw: data });
    }

    // Try to parse the JSON from the response
    let templates;
    try {
      // The AI might wrap JSON in markdown code blocks, strip them
      let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const startIndex = cleaned.indexOf('[');
      const endIndex = cleaned.lastIndexOf(']');
      if (startIndex !== -1 && endIndex !== -1) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
      }
      templates = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({
        error: 'Failed to parse AI response',
        raw: content,
      });
    }

    return res.json({ templates });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createEditorData = async (req, res) => {
  try {
    const { image, memeFormat } = req.body;

    if (!image || !memeFormat) {
      return res.status(400).json({ error: 'Image and memeFormat are required' });
    }

    const customPrompt = `${EDITOR_PROMPT}\n\nUser requested format: ${memeFormat}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || process.env.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: customPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Failed to create editor data',
        details: errorData,
      });
    }

    const data = await response.json();
    console.log('OpenRouter Response Data:', JSON.stringify(data, null, 2));
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content in AI response', raw: data });
    }

    let editorData;
    try {
      let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const startIndex = cleaned.indexOf('{');
      const endIndex = cleaned.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
      }
      editorData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({
        error: 'Failed to parse AI response',
        raw: content,
      });
    }

    return res.json({ editorData });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { generateMemeTemplates, createEditorData };
