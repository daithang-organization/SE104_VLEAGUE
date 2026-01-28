import { Card, Empty, Spin, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';

function Placeholder({ loading, title }: { loading: boolean; title: string }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
        <Spin />
      </div>
    );
  }
  return <Empty description={`No ${title} data yet`} />;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Reports
      </Typography.Title>

      <Tabs
        items={[
          {
            key: 'scorers',
            label: 'Scorers',
            children: <Placeholder loading={loading} title="scorers" />,
          },
          {
            key: 'cards',
            label: 'Cards',
            children: <Placeholder loading={loading} title="cards" />,
          },
          {
            key: 'motm',
            label: 'MOTM',
            children: <Placeholder loading={loading} title="MOTM" />,
          },
        ]}
      />
    </Card>
  );
}
