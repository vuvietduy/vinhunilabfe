import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (values: any) => {
  const response = await axios.post(`${API_URL}/login`, values);
  return response.data;
};