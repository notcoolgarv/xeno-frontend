import { Tabs, Typography, Space } from 'antd';
import AdminPanel from './AdminPanel';
import { TenantLogin } from './TenantLogin';
import type { TabsProps } from 'antd';

interface AuthLandingProps {
  onTenantAuthenticated: (tenantId: string) => void;
}

export function AuthLanding({ onTenantAuthenticated }: AuthLandingProps) {
  const items: TabsProps['items'] = [
    { key: 'admin', label: 'Admin', children: <AdminPanel tenantId={null} /> },
    { key: 'tenant', label: 'Tenant User', children: <TenantLogin onAuthenticated={onTenantAuthenticated} /> }
  ];
  return (
    <div className="center-screen">
      <div className="stack stack-gap-lg" style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={3} style={{ marginBottom: 4 }} className="text-strong">Xeno Commerce Intelligence</Typography.Title>
          <Typography.Text className="text-muted" style={{ fontSize: 14 }}>Sign in as platform admin or tenant user</Typography.Text>
        </div>
        <Tabs className="elevated-card" items={items} />
        <Space direction="vertical" size={4} style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Need an account? Bootstrap an admin in seconds.</Typography.Text>
        </Space>
      </div>
    </div>
  );
}
