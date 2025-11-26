import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../interfaces/http-adapter.interfaces';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AxiosAdaptar implements HttpAdapter {
  private readonly axios: AxiosInstance = axios;
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error('Error fetching data');
    }
  }
}
