import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenantAnalytics, getTenantLogs, ingestData, type SyncLog, type TenantAnalytics } from '../lib/api';
import { Card, Button, Row, Col, Statistic, List, Spin, App, Space, Alert } from 'antd';
import { RevenueOverTimeChart } from './RevenueOverTimeChart';
import { EventsSummaryChart } from './EventsSummaryChart';
import { useAuth } from '../context/AuthContext';

interface TenantDetailsProps {
    tenantId: string;
}

const TenantDetails = ({ tenantId }: TenantDetailsProps) => {
    const queryClient = useQueryClient();
    const { message } = App.useApp();
    const { user, isTenant, isAdmin } = useAuth();

    // Check if user is authenticated (either admin or tenant)
    const isAuthenticated = isAdmin || (isTenant && user?.kind === 'tenant');
    const currentTenantId = user?.kind === 'tenant' ? user.tenantId : null;

    // Admin can access any tenant's data, tenant can only access their own
    const canAccessData = isAdmin || (isAuthenticated && currentTenantId === tenantId);

    const { data: analytics, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery<TenantAnalytics>({
        queryKey: ['analytics', tenantId],
        queryFn: () => getTenantAnalytics(tenantId),
        enabled: canAccessData,
    });

    const { data: logs, isLoading: isLoadingLogs, error: logsError } = useQuery<SyncLog[]>({
        queryKey: ['logs', tenantId],
        queryFn: () => getTenantLogs(tenantId),
        enabled: canAccessData,
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

    // Show authentication required message if not authenticated
    if (!isAuthenticated) {
        return (
            <Card title="Tenant Details">
                <Alert 
                    type="warning" 
                    showIcon 
                    message="Authentication Required" 
                    description="Please log in as an admin or tenant user to view analytics and manage data ingestion."
                />
            </Card>
        );
    }

    // Show access denied if tenant trying to access wrong tenant (admins can access any)
    if (isTenant && !isAdmin && currentTenantId !== tenantId) {
        return (
            <Card title="Tenant Details">
                <Alert 
                    type="error" 
                    showIcon 
                    message="Access Denied" 
                    description="You can only access data for your own tenant. Admins can view all tenants."
                />
            </Card>
        );
    }

    return (
        <Card title="Tenant Details">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert 
                    type="success" 
                    showIcon 
                    message={`Authenticated as: ${user?.email || 'User'} ${isAdmin ? '(Admin)' : '(Tenant)'}`}
                    description={
                        isAdmin 
                            ? `Viewing tenant: ${tenantId}` 
                            : `Shop: ${user?.kind === 'tenant' ? user.shopDomain : 'Loading...'}`
                    }
                />
                
                <Button
                    type="primary"
                    onClick={handleIngest}
                    loading={ingestMutation.isPending}
                    disabled={!canAccessData}
                    block
                >
                    Trigger Data Ingestion
                </Button>

                {analyticsError && (
                    <Alert type="error" showIcon message={(analyticsError as any).message || 'Analytics error'} />
                )}
                {logsError && (
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
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Sync Logs</h3>
                    <List
                        size="small"
                        bordered
                        loading={isLoadingLogs}
                        dataSource={logs}
                        renderItem={(log) => (
                            <List.Item>
                                <span style={{ color: '#8c8c8c', fontSize: '12px', marginRight: '8px' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                    [{log.level}]: {log.message}
                                </span>
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
