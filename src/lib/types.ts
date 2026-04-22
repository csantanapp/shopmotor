export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: string;
  km: number;
  price: number;
  previousPrice?: number | null;
  fipePrice?: number | null;
  city: string;
  state: string;
  image: string;
  badge?: string;
}
