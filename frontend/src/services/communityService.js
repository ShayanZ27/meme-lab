import axios from 'axios';

const API_URL = 'http://localhost:5000/api/community';

export const uploadMeme = async (imageData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/upload`, { imageData }, config);
  return response.data;
};

export const getMemeById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const reactToMeme = async (id, reactionType, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.post(`${API_URL}/${id}/react`, { reactionType }, config);
  return response.data;
};

export const getTrendingMemes = async (timeframe = 'all_time') => {
  const response = await axios.get(`${API_URL}/trending?timeframe=${timeframe}`);
  return response.data;
};
