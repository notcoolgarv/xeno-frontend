import { useQuery } from '@tanstack/react-query';
import { getStats } from '../lib/api';
import { Card, Col, Row, Statistic, Spin } from 'antd';

export function StatCard() {
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ['stats'],
        queryFn: getStats
    });

    if (isError) return <div>Error: {error.message}</div>;

    return (
        <Spin spinning={isLoading}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Revenue" value={stats?.totalRevenue} prefix="₹" precision={2} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Orders" value={stats?.totalOrders} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Customers" value={stats?.totalCustomers} />
                    </Card>
                </Col>
            </Row>
        </Spin>
    );
}
