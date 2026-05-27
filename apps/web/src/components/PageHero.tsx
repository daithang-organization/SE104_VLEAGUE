import { Space, Typography } from 'antd';
import type { ReactNode } from 'react';

export type PageHeroMetric = {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
};

type PageHeroProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  metrics?: PageHeroMetric[];
  actions?: ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
};

export function PageHero({
  title,
  eyebrow,
  description,
  icon,
  metrics = [],
  actions,
  variant = 'default',
  className,
}: PageHeroProps) {
  const rootClassName = [
    'page-hero',
    variant === 'compact' ? 'page-hero-compact' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClassName}>
      <div className="page-hero-main">
        {icon && <div className="page-hero-icon">{icon}</div>}
        <div className="page-hero-copy">
          {eyebrow && <Typography.Text className="page-hero-eyebrow">{eyebrow}</Typography.Text>}
          <Typography.Title level={variant === 'compact' ? 4 : 2} className="page-hero-title">
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
                  <strong>{metric.value}</strong>
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

export default PageHero;
