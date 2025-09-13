import { useQuery } from '@tanstack/react-query';
import { getTenants } from '../lib/api';
import { Card, List, Alert } from 'antd';

interface TenantListProps {
    onTenantSelect: (tenantId: string) => void;
    selectedTenantId: string | null;
}

const TenantList = ({ onTenantSelect, selectedTenantId }: TenantListProps) => {
    const { data: tenants, isLoading, isError, error } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants
    });

    if (isError) {
        return <Alert message={`Error fetching tenants: ${error.message}`} type="error" />;
    }

    return (
        <Card title="Tenants">
            <List
                loading={isLoading}
                dataSource={tenants}
                renderItem={tenant => (
                    <List.Item
                        onClick={() => onTenantSelect(tenant.id)}
                        style={{ 
                            cursor: 'pointer', 
                            backgroundColor: selectedTenantId === tenant.id ? '#e6f7ff' : 'transparent' 
                        }}
                        className="hover:bg-gray-50"
                    >
                        {tenant.shop_domain}
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default TenantList;
