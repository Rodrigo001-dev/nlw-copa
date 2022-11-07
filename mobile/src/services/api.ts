import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://172.25.58.14:3333'
});