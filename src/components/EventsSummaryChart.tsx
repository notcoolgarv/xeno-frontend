import { useQuery } from '@tanstack/react-query';
import { getEventsSummary } from '../lib/api';
import { Select } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Line } from 'recharts';
import { useState, useMemo } from 'react';
import { ChartCard } from './ui/ChartCard';

interface Props { tenantId: string; }

export function EventsSummaryChart({ tenantId }: Props) {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ['events-summary', tenantId, days],
    queryFn: () => getEventsSummary(tenantId, days),
    enabled: !!tenantId
  });

  const chartData = useMemo(() => (data?.daily || []).map(d => ({
    day: d.day,
    checkout_started: Number(d.checkout_started),
    cart_abandoned: Number(d.cart_abandoned)
  })), [data]);

  return (
    <ChartCard
      title="Checkout Funnel & Abandonment"
      extra={<Select size="small" value={days} onChange={setDays} style={{ width: 100 }} options={[
        { value: 7, label: '7d' }, { value: 30, label: '30d' }, { value: 60, label: '60d' }, { value: 90, label: '90d' }
      ]} />}
      loading={isLoading}
      error={undefined}
      dataLength={chartData.length}
      height={320}
    >
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 1]} />
          <Tooltip formatter={(value: any, name: any) => name.includes('Rate') ? [(value * 100).toFixed(1) + '%', name] : [value, name]} />
          <Legend />
          <Bar yAxisId="left" dataKey="checkout_started" name="Checkout Started" fill="#2196f3" />
          <Bar yAxisId="left" dataKey="cart_abandoned" name="Cart Abandoned" fill="#f44336" />
          <Line yAxisId="right" type="monotone" dataKey="abandonment_rate" name="Abandon Rate" stroke="#ff9800" dot={false} strokeDasharray="4 2" />
          <Line yAxisId="right" type="monotone" dataKey="conversion_rate" name="Conversion Rate" stroke="#4caf50" dot={false} strokeDasharray="3 2" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
