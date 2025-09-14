import { useQuery } from '@tanstack/react-query';
import { getRevenueOverTime } from '../lib/api';
import { Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState } from 'react';
import { ChartCard } from './ui/ChartCard';

interface Props { tenantId: string; }

export function RevenueOverTimeChart({ tenantId }: Props) {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ['revenue-over-time', tenantId, days],
    queryFn: () => getRevenueOverTime(tenantId, days),
    enabled: !!tenantId
  });

  return (
    <ChartCard
      title="Revenue, Orders & AOV"
      extra={<Select size="small" value={days} onChange={setDays} style={{ width: 100 }} options={[
        { value: 7, label: '7d' }, { value: 30, label: '30d' }, { value: 60, label: '60d' }, { value: 90, label: '90d' }
      ]} />}
      loading={isLoading}
      error={undefined}
  dataLength={(data?.daily || []).length}
      height={320}
    >
      <ResponsiveContainer>
        <LineChart data={data?.daily || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#3f51b5" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#ff7043" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="aov" name="AOV" stroke="#009688" dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
