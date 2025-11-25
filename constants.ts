import { Material, User, UserRole } from './types';

export const MATERIALS: Material[] = [
  { id: 'alca-branca', name: 'Alça Branca' },
  { id: 'alca-vermelha', name: 'Alça Vermelha' },
  { id: 'alca-azul', name: 'Alça Azul' },
  { id: 'alca-preta', name: 'Alça Preta' },
  { id: 'bape-02', name: 'Bape 02' },
  { id: 'bape-03', name: 'Bape 03' },
  { id: 'olhal-galv', name: 'Olhal Galvanizado' },
  { id: 'olhal-reto', name: 'Olhal Reto' },
  { id: 'parafuso', name: 'Parafuso' },
  { id: 'espina', name: 'Espina' },
  { id: 'plaqueta', name: 'Plaqueta' },
  { id: 'supa', name: 'Supa' },
  { id: 'fo-1', name: 'F.O.' },
  { id: 'fo-2', name: 'F.O. (segunda linha)' },
];

export const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  name: 'Administrador',
  email: 'admin@admin.com',
  password: '123',
  role: UserRole.ADMIN,
  active: true,
};

export const DEFAULT_USER: User = {
  id: 'user-001',
  name: 'Usuário Padrão',
  email: 'user@user.com',
  password: '123',
  role: UserRole.USER,
  active: true,
};
