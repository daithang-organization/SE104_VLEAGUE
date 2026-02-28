import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const nav = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="403"
      title={t('forbidden.title')}
      subTitle={t('forbidden.subtitle')}
      extra={
        <Button type="primary" onClick={() => nav('/')}>
          {t('forbidden.backBtn')}
        </Button>
      }
    />
  );
}
