import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor() {
    const clientID = process.env.FACEBOOK_APP_ID || 'not-configured';
    const clientSecret = process.env.FACEBOOK_APP_SECRET || 'not-configured';

    super({
      clientID,
      clientSecret,
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL ||
        'http://localhost:8080/api/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    });

    if (clientID === 'not-configured' || clientSecret === 'not-configured') {
      this.logger.warn(
        'Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env',
      );
    }
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: unknown) => void,
  ): void {
    const { id, emails, displayName, photos } = profile;

    const user = {
      facebookId: id,
      email: emails?.[0]?.value || '',
      name: displayName,
      avatarUrl: photos?.[0]?.value,
    };

    done(null, user);
  }
}
