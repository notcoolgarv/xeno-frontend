import { Card } from 'antd';
import type { ReactNode } from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

interface ChartCardProps {
  title: string;
  extra?: ReactNode;
  loading?: boolean;
  error?: any;
  dataLength?: number;
  children: ReactNode;
  height?: number;
}

export function ChartCard({ title, extra, loading, error, dataLength, children, height = 300 }: ChartCardProps) {
  let body: ReactNode = children;
  if (loading) body = <LoadingSkeleton height={height} />;
  else if (error) body = <ErrorState error={error} />;
  else if (dataLength === 0) body = <EmptyState />;

  return (
    <Card title={title} extra={extra} size="small" bodyStyle={{ padding: 0 }} style={{ overflow: 'hidden' }}>
      <div className="chart-container" style={{ height, padding: 12 }}>
        {body}
      </div>
    </Card>
  );
}
