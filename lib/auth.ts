import { StorageService } from './storage';

const USERS = [
  { username: 'admin', password: '123456' },
  { username: 'cozinha', password: 'cozinha123' },
  { username: 'delivery', password: 'delivery123' }
];

export class AuthService {
  static login(username: string, password: string): boolean {
    const user = USERS.find(u => u.username === username && u.password === password);

    if (user) {
      StorageService.saveUser(username);
      return true;
    }

    return false;
  }

  static logout(): void {
    StorageService.logout();
  }

  static isAuthenticated(): boolean {
    return StorageService.getUser() !== null;
  }

  static getCurrentUser(): string | null {
    const user = StorageService.getUser();
    return user?.username || null;
  }
}