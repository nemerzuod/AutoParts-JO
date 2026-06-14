export interface Category {
  id: number;
  name: string;
  nameAr: string;
}

export interface Fitment {
  id?: number;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}

export interface Part {
  id: number;
  name: string;
  nameAr: string;
  partNumber: string;
  brand: string;
  description: string | null;
  price: number;
  quantity: number;
  minQuantity: number;
  branch: string;
  categoryId: number;
  category: Category;
  fitments: Fitment[];
}
