export interface Product {
  id: string;
  name: string;
  barcode: string;
  barcode_url: string;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
}

export interface UpdateProductRequest {
  name: string;
}

export interface ProductsResponse {
  estado: 'exito';
  data: Product[];
}

export interface ProductResponse {
  estado: 'exito';
  message: string;
  data: Product;
}
