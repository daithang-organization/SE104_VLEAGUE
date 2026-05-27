import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHero } from '../PageHero';

describe('PageHero', () => {
  it('renders title, description, icon, metrics, and actions', () => {
    const { container } = render(
      <PageHero
        eyebrow="VLeague"
        title="Quan ly cau lac bo"
        description="Tong quan van hanh giai dau"
        icon={<TeamOutlined />}
        metrics={[
          { label: 'Tong CLB', value: 14 },
          { label: 'Dang hoat dong', value: 12 },
        ]}
        actions={<button type="button">Them moi</button>}
      />,
    );

    expect(container.querySelector('.page-hero')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quan ly cau lac bo' })).toBeInTheDocument();
    expect(screen.getByText('Tong quan van hanh giai dau')).toBeInTheDocument();
    expect(screen.getByText('Tong CLB')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Them moi' })).toBeInTheDocument();
  });

  it('supports the compact variant for data-heavy pages', () => {
    const { container } = render(
      <PageHero
        variant="compact"
        title="Lich thi dau"
        icon={<PlusOutlined />}
        metrics={[{ label: 'Tran dau', value: 26 }]}
      />,
    );

    expect(container.querySelector('.page-hero-compact')).toBeInTheDocument();
  });
});
