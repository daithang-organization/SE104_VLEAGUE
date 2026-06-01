import { Space, Typography } from 'antd';
import type { ReactNode } from 'react';

export type PageCoverMetric = {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
};

export type PageCoverProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  metrics?: PageCoverMetric[];
  actions?: ReactNode;
  className?: string;
};

export function PageCover({
  title,
  eyebrow: _eyebrow,
  description,
  icon,
  metrics = [],
  actions,
  className,
}: PageCoverProps) {
  const rootClassName = ['page-cover', 'page-hero', className ?? ''].filter(Boolean).join(' ');

  return (
    <section className={rootClassName}>
      <div className="page-hero-main">
        {icon && <div className="page-hero-icon">{icon}</div>}
        <div className="page-hero-copy">
          <Typography.Title level={2} className="page-hero-title">
            {title}
          </Typography.Title>
          {description && (
            <Typography.Paragraph className="page-hero-description">
              {description}
            </Typography.Paragraph>
          )}
        </div>
      </div>

      {(metrics.length > 0 || actions) && (
        <div className="page-hero-side">
          {metrics.length > 0 && (
            <div className="page-hero-metrics">
              {metrics.map((metric, index) => (
                <div className="page-hero-metric" key={index}>
                  <Space size={8} align="center">
                    {metric.icon && <span className="page-hero-metric-icon">{metric.icon}</span>}
                    <Typography.Text className="page-hero-metric-label">
                      {metric.label}
                    </Typography.Text>
                  </Space>
                  <strong
                    className={
                      typeof metric.value === 'string' || typeof metric.value === 'number'
                        ? undefined
                        : 'page-hero-metric-rich'
                    }
                  >
                    {metric.value}
                  </strong>
                </div>
              ))}
            </div>
          )}
          {actions && <div className="page-hero-actions">{actions}</div>}
        </div>
      )}
    </section>
  );
}

export default PageCover;
