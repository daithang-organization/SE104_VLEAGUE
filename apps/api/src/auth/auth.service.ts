import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(username: string, password: string) {
    // Sprint 0 stub token
    return {
      accessToken: `stub-token-${Buffer.from(username).toString('base64')}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async refresh() {
    return {
      accessToken: `stub-token-refresh-${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async logout() {
    return { ok: true };
  }
}
