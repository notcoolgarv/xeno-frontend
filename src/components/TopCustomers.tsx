import { useQuery } from '@tanstack/react-query';
import { getTopCustomers } from '../lib/api';
import { Card, Table, Alert } from 'antd';

export function TopCustomers() {
    const { data: customers, isLoading, isError, error } = useQuery({
        queryKey: ['topCustomers', 5],
        queryFn: () => getTopCustomers(5)
    });

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Total Spend',
            dataIndex: 'total_spend',
            key: 'total_spend',
            render: (spend: number) => `₹${spend.toFixed(2)}`,
        },
    ];

    return (
        <Card title="Top Customers by Spend">
            {isError && <Alert message={`Error: ${error.message}`} type="error" style={{ marginBottom: 16 }} />}
            <Table
                columns={columns}
                dataSource={(customers || []).slice(0,5)}
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
            />
        </Card>
    );
}