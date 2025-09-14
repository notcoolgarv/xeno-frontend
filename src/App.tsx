import { useState, useEffect } from 'react';
import { Typography, Row, Col, Space } from 'antd';
import { useAuth } from './context/AuthContext';
import AdminPanel from './components/AdminPanel';
import TenantConnectShopify from './components/TenantConnectShopify';
import TenantList from './components/TenantList';
import CreateTenantForm from './components/CreateTenantForm';
import TenantDetails from './components/TenantDetails';
import { AppShell } from './components/layout/AppShell';
import { useKpis } from './lib/analyticsHooks';
import { EventsSummaryChart } from './components/EventsSummaryChart';
import { RevenueOverTimeChart } from './components/RevenueOverTimeChart';
import { CustomerGrowthChart } from './components/CustomerGrowthChart';
import { ProductGrowthChart } from './components/ProductGrowthChart';
import { KpiCard } from './components/ui/KpiCard';
import { AuthLanding } from './components/AuthLanding';

function App() {
  const [adminSelectedTenantId, setAdminSelectedTenantId] = useState<string | null>(null);
  const [activeAdminView, setActiveAdminView] = useState('admin.tenants');
  const [activeTenantView, setActiveTenantView] = useState('tenant.dashboard');
  const { user, loading, logout, isTenant, tenantId: tenantContextId, tenantShopDomain } = useAuth();
  const effectiveTenantId = isTenant ? tenantContextId : adminSelectedTenantId;
  const kpis = useKpis(effectiveTenantId, { enabled: !!effectiveTenantId });

  const tenantNeedsConnect = isTenant && user?.kind === 'tenant' && !(user as any).hasAccessToken;
  const tenantConnected = isTenant && user?.kind === 'tenant' && (user as any).hasAccessToken;

  useEffect(() => {
    function handler() {
      setActiveAdminView('admin.tenants');
    }
    window.addEventListener('xeno:admin-logged-in', handler);
    return () => window.removeEventListener('xeno:admin-logged-in', handler);
  }, []);

  return (
    <>
      {loading && <Typography.Text style={{ padding: 32, display: 'block' }}>Loading session...</Typography.Text>}
      {!loading && !user && (
        <AuthLanding onTenantAuthenticated={() => { }} />
      )}
      {!loading && user && (
        <AppShell
          mode={isTenant ? 'tenant' : 'admin'}
            userEmail={user.email}
            active={isTenant ? activeTenantView : activeAdminView}
            onActiveChange={(key) => isTenant ? setActiveTenantView(key) : setActiveAdminView(key)}
            onLogout={logout}
        >
          {isTenant && tenantNeedsConnect && (
            <TenantConnectShopify shopDomain={tenantShopDomain || ''} onConnected={() => { }} />
          )}
          {!isTenant && !adminSelectedTenantId && activeAdminView === 'admin.tenants' && (
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <CreateTenantForm />
                  <TenantList onTenantSelect={(tid) => { setAdminSelectedTenantId(tid); setActiveAdminView('admin.analytics'); }} selectedTenantId={adminSelectedTenantId} />
                </Space>
              </Col>
              <Col span={8}>
                <AdminPanel tenantId={adminSelectedTenantId} />
              </Col>
            </Row>
          )}
          {!isTenant && !adminSelectedTenantId && activeAdminView === 'admin.analytics' && (
            <Typography.Paragraph>Select a tenant on the Tenants view to see analytics.</Typography.Paragraph>
          )}
          {!isTenant && adminSelectedTenantId && activeAdminView === 'admin.analytics' && (
            <TenantDetails tenantId={adminSelectedTenantId} />
          )}
          {isTenant && tenantConnected && effectiveTenantId && activeTenantView === 'tenant.dashboard' && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}><KpiCard title="Revenue" value={kpis.data?.revenue ?? 0} precision={2} /></Col>
                <Col xs={12} md={6}><KpiCard title="Orders" value={kpis.data?.orders ?? 0} /></Col>
                <Col xs={12} md={6}><KpiCard title="AOV" value={kpis.data?.aov ?? 0} precision={2} /></Col>
                <Col xs={12} md={6}><KpiCard title="Repeat Rate" value={(kpis.data?.repeat_customer_rate ?? 0) * 100} precision={1} suffix="%" /></Col>
              </Row>
              <Row gutter={[16,16]}>
                <Col xs={24} lg={12}><RevenueOverTimeChart tenantId={effectiveTenantId!} /></Col>
                <Col xs={24} lg={12}><EventsSummaryChart tenantId={effectiveTenantId!} /></Col>
              </Row>
            </Space>
          )}
          {isTenant && tenantConnected && effectiveTenantId && activeTenantView === 'tenant.analytics' && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Row gutter={[16,16]}>
                <Col xs={24} lg={12}><CustomerGrowthChart tenantId={effectiveTenantId!} /></Col>
                <Col xs={24} lg={12}><ProductGrowthChart tenantId={effectiveTenantId!} /></Col>
              </Row>
              <TenantDetails tenantId={effectiveTenantId!} />
            </Space>
          )}
        </AppShell>
      )}
    </>
  );
}
export default App;