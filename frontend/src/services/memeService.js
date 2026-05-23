const API_BASE = 'http://localhost:5000';

export const generateMemeTemplates = async (imageDataUrl) => {
  const response = await fetch(`${API_BASE}/api/meme/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate meme templates');
  }

  const data = await response.json();
  return data.templates;
};

export const generateEditorData = async (imageDataUrl, memeFormat) => {
  const response = await fetch(`${API_BASE}/api/meme/create-editor-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl, memeFormat }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate editor data');
  }

  const data = await response.json();
  return data.editorData;
};
