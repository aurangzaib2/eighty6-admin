export enum Role {
  SYSTEM_OWNER = 'SYSTEM_OWNER',
  SYSTEM_USER = 'SYSTEM_USER',
  SYSTEM_SUPPLIER = 'SYSTEM_SUPPLIER',
  SYSTEM_MANAGER = 'SYSTEM_MANAGER',
  USER = 'USER',
}

export const getAllRolesArray = () => {
  return [
    Role.SYSTEM_OWNER,
    Role.SYSTEM_USER,
    Role.SYSTEM_SUPPLIER,
    Role.SYSTEM_MANAGER
  ]
};


interface UserProfile {
  name: string;
  profile: string;
  picture: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  username: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
  status: string;
  permissions: [string]
  hasDeleteAccess: boolean;
  role: string;
  banner: string;
  logoKey: string;
  bannerKey: string;
  profilePicture: string;
  facebook: boolean;
  google: boolean;
  countryName: string;
  variablesId: string;
  region: string;
}
