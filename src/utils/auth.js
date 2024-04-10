import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const Urlauth = 'https://us-central1-dataneroun.cloudfunctions.net/api/api/auth';


export const login = async (username, password) => {
  try {
    const response = await axios.post(`${Urlauth}/login`, { username, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const register = async (username, password) => {
  try {
    await axios.post(`${Urlauth}/register`, { username, password });
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      jwtDecode(token);
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};