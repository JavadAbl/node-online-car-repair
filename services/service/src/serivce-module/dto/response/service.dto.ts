import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ServiceDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;
}
