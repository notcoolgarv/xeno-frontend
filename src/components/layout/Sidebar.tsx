import { Menu } from 'antd';
import { DashboardOutlined, ApartmentOutlined, LineChartOutlined, LogoutOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface NavItem { key: string; label: string; icon?: ReactNode; }

interface SidebarProps {
  mode: 'admin' | 'tenant';
  active: string;
  onChange: (key: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ mode, active, onChange, onLogout }: SidebarProps) {
  const base: NavItem[] = mode === 'admin'
    ? [
        { key: 'admin.tenants', label: 'Tenants', icon: <ApartmentOutlined /> },
        { key: 'admin.analytics', label: 'Analytics', icon: <LineChartOutlined /> }
      ]
    : [
        { key: 'tenant.dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { key: 'tenant.analytics', label: 'Analytics', icon: <LineChartOutlined /> }
      ];

  const items = [
    ...base.map(i => ({ key: i.key, icon: i.icon, label: i.label })),
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[active]}
          onClick={(e) => {
            if (e.key === 'logout') { onLogout?.(); return; }
            onChange(e.key);
          }}
          items={items as any}
          style={{ borderRight: 0 }}
        />
      </div>
      <div style={{ padding: 12, fontSize: 11, opacity: .6 }}>Xeno Dashboard</div>
    </div>
  );
}
