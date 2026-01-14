export interface User {
    id: string;
    name: string;
    email:string;
}

interface Location {
  id: string;
  name: string;
  isChecked?: boolean;
}
interface Location2 {
  label: string;
  value: string;
  isChecked?: boolean;
}

export interface UserTemplate {
  fullname: string;
  phone: string;
  direction: string;
  email: string;
  location?: Location[] | [];
  userId?: string;
  status?: string;
  type?: string;
  createdAt?: string;
}