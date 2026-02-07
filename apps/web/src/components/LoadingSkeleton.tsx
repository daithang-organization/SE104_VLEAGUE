import { Card, Skeleton, Space, Table } from 'antd';
import type { FC } from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'form' | 'profile' | 'list';
  rows?: number;
}

/**
 * Loading skeleton components for better UX during data loading
 */
export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({ type = 'card', rows = 3 }) => {
  switch (type) {
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'form':
      return <FormSkeleton />;
    case 'profile':
      return <ProfileSkeleton />;
    case 'list':
      return <ListSkeleton rows={rows} />;
    case 'card':
    default:
      return <CardSkeleton />;
  }
};

/**
 * Card skeleton for dashboard cards
 */
export const CardSkeleton: FC = () => (
  <Card style={{ marginBottom: 16 }}>
    <Skeleton active avatar paragraph={{ rows: 2 }} />
  </Card>
);

/**
 * Table skeleton for data tables
 */
export const TableSkeleton: FC<{ rows?: number }> = ({ rows = 5 }) => {
  const columns = [
    { title: '', dataIndex: 'col1', key: 'col1', width: '30%' },
    { title: '', dataIndex: 'col2', key: 'col2', width: '25%' },
    { title: '', dataIndex: 'col3', key: 'col3', width: '25%' },
    { title: '', dataIndex: 'col4', key: 'col4', width: '20%' },
  ];

  const data = Array.from({ length: rows }, (_, index) => ({
    key: index,
    col1: <Skeleton.Input active size="small" style={{ width: '100%' }} />,
    col2: <Skeleton.Input active size="small" style={{ width: '80%' }} />,
    col3: <Skeleton.Input active size="small" style={{ width: '90%' }} />,
    col4: <Skeleton.Button active size="small" />,
  }));

  return (
    <Card>
      <Skeleton.Input active size="large" style={{ width: 200, marginBottom: 16 }} />
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        showHeader={false}
        size="small"
      />
    </Card>
  );
};

/**
 * Form skeleton for form pages
 */
export const FormSkeleton: FC = () => (
  <Card style={{ maxWidth: 500, margin: '0 auto' }}>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 8 }} />
        <Skeleton.Input active size="large" style={{ width: '100%' }} />
      </div>
      <div>
        <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
        <Skeleton.Input active size="large" style={{ width: '100%' }} />
      </div>
      <div>
        <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 8 }} />
        <Skeleton.Input active size="large" style={{ width: '100%' }} />
      </div>
      <Skeleton.Button active size="large" style={{ width: 120 }} />
    </Space>
  </Card>
);

/**
 * Profile skeleton for user profile pages
 */
export const ProfileSkeleton: FC = () => (
  <Card>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space align="center" size="large">
        <Skeleton.Avatar active size={80} />
        <div>
          <Skeleton.Input active size="large" style={{ width: 200, marginBottom: 8 }} />
          <Skeleton.Input active size="small" style={{ width: 150 }} />
        </div>
      </Space>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Space>
  </Card>
);

/**
 * List skeleton for list views
 */
export const ListSkeleton: FC<{ rows?: number }> = ({ rows = 3 }) => (
  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    {Array.from({ length: rows }, (_, index) => (
      <Card key={index} size="small">
        <Skeleton active avatar={{ size: 'small' }} paragraph={{ rows: 1 }} />
      </Card>
    ))}
  </Space>
);

export default LoadingSkeleton;
