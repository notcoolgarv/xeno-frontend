import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenantAnalytics, getTenantLogs, ingestData, type SyncLog, type TenantAnalytics, setApiKey, loadStoredApiKey } from '../lib/api';
import { useState } from 'react';
import { Card, Button, Row, Col, Statistic, List, Spin, App, Space, Input, Typography, Divider, Alert } from 'antd';
import { RevenueOverTimeChart } from './RevenueOverTimeChart';
import { EventsSummaryChart } from './EventsSummaryChart';

interface TenantDetailsProps {
    tenantId: string;
}

const TenantDetails = ({ tenantId }: TenantDetailsProps) => {
    const queryClient = useQueryClient();
    const [apiKeyInput, setApiKeyInput] = useState<string>(loadStoredApiKey() || '');
    const { message } = App.useApp();

    const hasApiKey = !!apiKeyInput.trim();
    const { data: analytics, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery<TenantAnalytics>({
        queryKey: ['analytics', tenantId],
        queryFn: () => getTenantAnalytics(tenantId),
        enabled: !!tenantId && hasApiKey,
    });

    const { data: logs, isLoading: isLoadingLogs, error: logsError } = useQuery<SyncLog[]>({
        queryKey: ['logs', tenantId],
        queryFn: () => getTenantLogs(tenantId),
        enabled: !!tenantId && hasApiKey,
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

    const handleSaveApiKey = () => {
        setApiKey(apiKeyInput.trim() || null);
        message.success('API key updated');
        queryClient.invalidateQueries({ queryKey: ['analytics', tenantId] });
        queryClient.invalidateQueries({ queryKey: ['logs', tenantId] });
        queryClient.invalidateQueries({ queryKey: ['events-summary', tenantId] });
        queryClient.invalidateQueries({ queryKey: ['revenue-over-time', tenantId] });
    };

    return (
        <Card title="Tenant Details">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Typography.Text strong>Authentication</Typography.Text>
                <Input.Password
                    placeholder="Enter API key (xsk_...)"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    onPressEnter={handleSaveApiKey}
                />
                <Button onClick={handleSaveApiKey}>Set API Key</Button>
                <Divider style={{ margin: '12px 0' }} />
                                <Button
                    type="primary"
                    onClick={handleIngest}
                                        loading={ingestMutation.isPending}
                                        disabled={!hasApiKey}
                    block
                >
                    Trigger Data Ingestion
                </Button>

                                {!hasApiKey && (
                                    <Alert type="info" showIcon message="Set a tenant API key above to load analytics and trigger ingestion." />
                                )}

                                {analyticsError && hasApiKey && (
                                    <Alert type="error" showIcon message={(analyticsError as any).message || 'Analytics error'} />
                                )}
                                {logsError && hasApiKey && (
                                    <Alert type="error" showIcon message={(logsError as any).message || 'Logs error'} />
                                )}

                <Spin spinning={isLoadingAnalytics}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic title="Total Customers" value={analytics?.total_customers ?? 0} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Total Products" value={analytics?.total_products ?? 0} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Total Orders" value={analytics?.total_orders ?? 0} />
                        </Col>
                    </Row>
                </Spin>

                <RevenueOverTimeChart tenantId={tenantId} />
                <EventsSummaryChart tenantId={tenantId} />

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
