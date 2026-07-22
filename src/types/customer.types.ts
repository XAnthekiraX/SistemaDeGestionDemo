export interface Customer {
  id: string;
  name: string;
  city: string;
  document_number: string;
  created_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  city: string;
  document_number: string;
}

export interface UpdateCustomerRequest {
  name: string;
  city: string;
  document_number: string;
}

export interface CustomersResponse {
  estado: 'exito';
  data: Customer[];
}

export interface CustomerResponse {
  estado: 'exito';
  data: Customer;
}
