import { Layout, Typography, Space, Switch } from 'antd';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const { Sider, Header, Content } = Layout;

interface AppShellProps {
  mode: 'admin' | 'tenant';
  userEmail?: string;
  active: string;
  onActiveChange: (key: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({ mode, userEmail, active, onActiveChange, onLogout, children }: AppShellProps) {
  const { dark, toggle } = useTheme();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible width={230} style={{ background: dark ? '#1f1f1f' : '#fff' }}>
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600, fontSize: 16, color: dark ? '#fff' : '#111' }}>
          {mode === 'admin' ? 'Admin' : 'Tenant'} Panel
        </div>
        <Sidebar mode={mode} active={active} onChange={onActiveChange} onLogout={onLogout} />
      </Sider>
      <Layout>
        <Header style={{ background: dark ? '#141414' : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{active.replace('.', ' / ')}</Typography.Title>
          <Space>
            <span style={{ fontSize: 12 }} className="text-muted">{userEmail}</span>
            <span style={{ fontSize: 12 }}>Dark</span>
            <Switch size="small" checked={dark} onChange={toggle} />
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
