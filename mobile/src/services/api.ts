import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://172.27.234.129:3333'
});