export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username: string;
  password?: string;
  roles: string[];
}

export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username: string;
  roles: string[];
}

export interface UserResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  username: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersListResponseDTO {
  users: UserResponseDTO[];
  total: number;
  page: number;
  limit: number;
}
