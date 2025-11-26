import { Module } from '@nestjs/common';
import { AxiosAdaptar } from './adapters/axios.adapter';

@Module({
  providers: [AxiosAdaptar],
  exports: [AxiosAdaptar],
})
export class CommonModule {}
