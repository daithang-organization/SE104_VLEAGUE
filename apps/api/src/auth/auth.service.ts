import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(username: string) {
    // Sprint 0 stub token
    return {
      accessToken: `stub-token-${Buffer.from(username).toString('base64')}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  refresh() {
    return {
      accessToken: `stub-token-refresh-${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  logout() {
    return { ok: true };
  }
}
