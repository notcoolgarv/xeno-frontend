import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenantAnalytics, getTenantLogs, ingestData, type SyncLog, type TenantAnalytics } from '../lib/api';
import { Card, Button, Row, Col, Statistic, List, Spin, App, Space } from 'antd';

interface TenantDetailsProps {
    tenantId: string;
}

const TenantDetails = ({ tenantId }: TenantDetailsProps) => {
    const queryClient = useQueryClient();
    const { message } = App.useApp();

    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<TenantAnalytics>({
        queryKey: ['analytics', tenantId],
        queryFn: () => getTenantAnalytics(tenantId),
        enabled: !!tenantId,
    });

    const { data: logs, isLoading: isLoadingLogs } = useQuery<SyncLog[]>({
        queryKey: ['logs', tenantId],
        queryFn: () => getTenantLogs(tenantId),
        enabled: !!tenantId,
    });

    const ingestMutation = useMutation({
        mutationFn: () => ingestData(tenantId),
        onSuccess: () => {
            message.success('Data ingestion started.');
            queryClient.invalidateQueries({ queryKey: ['analytics', tenantId] });
            queryClient.invalidateQueries({ queryKey: ['logs', tenantId] });
        },
        onError: (error) => {
            message.error(`Ingestion failed: ${error.message}`);
        }
    });

    const handleIngest = () => {
        ingestMutation.mutate();
    };

    return (
        <Card title="Tenant Details">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Button
                    type="primary"
                    onClick={handleIngest}
                    loading={ingestMutation.isPending}
                    block
                >
                    Trigger Data Ingestion
                </Button>

                <Spin spinning={isLoadingAnalytics}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic title="Total Customers" value={analytics?.total_customers} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Total Products" value={analytics?.total_products} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Total Orders" value={analytics?.total_orders} />
                        </Col>
                    </Row>
                </Spin>

                <div>
                    <h3 className="text-xl font-bold mb-2">Sync Logs</h3>
                    <List
                        size="small"
                        bordered
                        loading={isLoadingLogs}
                        dataSource={logs}
                        renderItem={(log) => (
                            <List.Item>
                                <span className="text-gray-500 text-xs mr-2">{new Date(log.timestamp).toLocaleString()}</span>
                                <span className="font-mono text-xs">[{log.level}]: {log.message}</span>
                            </List.Item>
                        )}
                        style={{ height: 250, overflowY: 'auto' }}
                    />
                </div>
            </Space>
        </Card>
    );
};

export default TenantDetails;
