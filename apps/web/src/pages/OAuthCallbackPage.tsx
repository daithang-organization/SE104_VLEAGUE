import { message, Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const { applyOAuthTokens } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      applyOAuthTokens(accessToken, refreshToken);
      message.success('Đăng nhập thành công');
      nav('/', { replace: true });
    } else {
      message.error('Đăng nhập thất bại');
      nav('/login', { replace: true });
    }
  }, [searchParams, applyOAuthTokens, nav]);

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="Đang xử lý đăng nhập..." />
    </div>
  );
}
