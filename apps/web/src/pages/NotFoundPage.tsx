import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
    >
      <Result
        status="404"
        title="404"
        subTitle={t('notFound.subtitle', 'Trang bạn tìm kiếm không tồn tại.')}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('notFound.backHome', 'Về trang chủ')}
          </Button>
        }
      />
    </div>
  );
}
