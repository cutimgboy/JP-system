import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = configService.get('FACEBOOK_APP_ID');
    const clientSecret = configService.get('FACEBOOK_APP_SECRET');
    const callbackURL = configService.get('FACEBOOK_CALLBACK_URL');

    super({
      clientID: clientID || 'facebook-oauth-disabled',
      clientSecret: clientSecret || 'facebook-oauth-disabled',
      callbackURL: callbackURL || 'http://localhost:3000/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });

    if (!clientID || !clientSecret || !callbackURL) {
      this.logger.warn(
        'Facebook OAuth is not fully configured. Related login endpoints will be unavailable until FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, and FACEBOOK_CALLBACK_URL are set.',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = await this.authService.validateOAuthLogin({
      provider: 'facebook',
      providerId: id,
      email: emails && emails[0] ? emails[0].value : undefined,
      nickname: name ? `${name.givenName} ${name.familyName}` : `User${id.slice(-4)}`,
      avatar: photos && photos[0] ? photos[0].value : undefined,
    });

    done(null, user);
  }
}
