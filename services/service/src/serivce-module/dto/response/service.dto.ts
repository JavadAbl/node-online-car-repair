import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ServiceDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  discountPercent: number;
}
