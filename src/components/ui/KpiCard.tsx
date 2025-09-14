import { Card, Statistic, Tooltip } from 'antd';
import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  precision?: number;
  suffix?: ReactNode;
  tooltip?: string;
}

export function KpiCard({ title, value, precision, suffix, tooltip }: KpiCardProps) {
  const stat = <Statistic title={title} value={value} precision={precision} suffix={suffix} />;
  return (
    <Card size="small" style={{ height: '100%' }} bodyStyle={{ padding: 12 }}>
      {tooltip ? <Tooltip title={tooltip}>{stat}</Tooltip> : stat}
    </Card>
  );
}
