import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID || 'not-configured';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'not-configured';

    super({
      clientID,
      clientSecret,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:8080/api/auth/google/callback',
      scope: ['email', 'profile'],
    });

    if (clientID === 'not-configured' || clientSecret === 'not-configured') {
      this.logger.warn(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;

    const user = {
      googleId: id,
      email: emails?.[0]?.value || '',
      name: displayName,
      avatarUrl: photos?.[0]?.value,
    };

    done(null, user);
  }
}
