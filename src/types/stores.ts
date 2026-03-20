export interface Validations {
  rate: number;
  time: number;
  type: string;
  unit: string;
  discount: boolean;
}

export interface IStore {
  address: string;
  createdBy: string;
  employees: string[];
  locationId: string;
  primaryContact: string;
  primaryPhone: string;
  storeId: string;
  title: string;
  updatedAt: string;
  updatedBy: string;
  validations: Validations[]
}
export interface validationPayload {
      storeId: string;
      type: string
      locationId: string
}