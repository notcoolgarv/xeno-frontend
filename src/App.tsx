import { useState } from 'react';
import { StatCard } from './components/StatCard';
import { OrdersByDate } from './components/OrdersByDate';
import { TopCustomers } from './components/TopCustomers';
import TenantList from './components/TenantList';
import CreateTenantForm from './components/CreateTenantForm';
import TenantDetails from './components/TenantDetails';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, Row, Col, Space } from 'antd';

const { Header, Content } = Layout;

const queryClient = new QueryClient();

function App() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Xeno Frontend</h1>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <StatCard />
                <OrdersByDate />
                <TopCustomers />
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <CreateTenantForm />
                <TenantList onTenantSelect={setSelectedTenantId} selectedTenantId={selectedTenantId} />
                {selectedTenantId && <TenantDetails tenantId={selectedTenantId} />}
              </Space>
            </Col>
          </Row>
        </Content>
      </Layout>
    </QueryClientProvider>
  );
}
export default App;