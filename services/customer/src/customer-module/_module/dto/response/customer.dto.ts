import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string | null;

  @Expose()
  lastName: string | null;

  @Expose()
  email: string | null;

  @Expose()
  mobile: string;

  @Expose()
  city: string | null;

  @Expose()
  address: string | null;
}
