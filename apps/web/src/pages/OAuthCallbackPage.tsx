import { message, Spin, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Text } = Typography;

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const { applyOAuthTokens } = useAuth();
  const { t } = useTranslation();
  const processed = useRef(false);

  useEffect(() => {
    // Prevent double processing in React StrictMode
    if (processed.current) return;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      processed.current = true;
      applyOAuthTokens(accessToken, refreshToken);
      message.success(t('oauth.success'));
      nav('/', { replace: true });
    } else {
      processed.current = true;
      message.error(t('oauth.error'));
      nav('/login', { replace: true });
    }
  }, [searchParams, applyOAuthTokens, nav]);

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <Spin size="large">
        <div style={{ padding: 50 }}>
          <Text>{t('oauth.processing')}</Text>
        </div>
      </Spin>
    </div>
  );
}
