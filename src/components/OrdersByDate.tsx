import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../lib/api';
import { format } from 'date-fns';
import { Card, Table, DatePicker, Button, Form, Alert } from 'antd';

const { RangePicker } = DatePicker;

export function OrdersByDate() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: orders, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['orders', startDate, endDate],
        queryFn: () => getOrders(startDate, endDate),
        enabled: false,
    });

    const handleFilter = () => {
        refetch();
    };

    const columns = [
        { title: 'Order #', dataIndex: 'order_number', key: 'order_number' },
        {
            title: 'Customer',
            key: 'customer',
            render: (_: unknown, record: { customer: { first_name: string; last_name: string; }; }) => `${record.customer.first_name} ${record.customer.last_name}`,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => format(new Date(date), 'PP'),
        },
        {
            title: 'Total',
            dataIndex: 'total_price',
            key: 'total_price',
            render: (price: number) => `₹${price.toFixed(2)}`,
        },
    ];

    return (
        <Card title="Recent Orders">
            <Form onFinish={handleFilter} layout="inline" style={{ marginBottom: 24 }}>
                <Form.Item>
                    <RangePicker onChange={(_, dateStrings) => {
                        setStartDate(dateStrings[0]);
                        setEndDate(dateStrings[1]);
                    }} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Filter
                    </Button>
                </Form.Item>
            </Form>
            {isError && <Alert message={`Error: ${error.message}`} type="error" style={{ marginBottom: 16 }} />}
            <Table
                columns={columns}
                dataSource={orders}
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
            />
        </Card>
    );
}

