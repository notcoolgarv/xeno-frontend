import { useState } from 'react';
import { Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { ChartCard } from './ui/ChartCard';
import { useProductGrowth } from '../lib/analyticsHooks';

interface Props { tenantId: string; }

export function ProductGrowthChart({ tenantId }: Props) {
  const [days, setDays] = useState(60);
  const { data, isLoading } = useProductGrowth(tenantId, days, { enabled: !!tenantId });
  return (
    <ChartCard
      title="Product Growth"
      loading={isLoading}
  dataLength={(data?.daily || []).length}
      extra={<Select size="small" value={days} onChange={setDays} style={{ width: 100 }} options={[{ value: 30, label: '30d' }, { value: 60, label: '60d' }, { value: 90, label: '90d' }]} />}
    >
      <ResponsiveContainer>
        <LineChart data={data?.daily || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="new_products" name="New" stroke="#8e24aa" dot={false} />
          <Line type="monotone" dataKey="cumulative_products" name="Cumulative" stroke="#ff7043" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
