import { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Input, Form, Tabs, message, type TabsProps } from 'antd';
import { startShopifyInstall, tenantMe, setTenantAccessToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface TenantConnectShopifyProps {
  shopDomain: string;
  onConnected: () => void;
}

export function TenantConnectShopify({ shopDomain, onConnected }: TenantConnectShopifyProps) {
  const [error, setError] = useState<string | null>(null);
  const [launched, setLaunched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pendingShop, setPendingShop] = useState(shopDomain || '');
  const [normalized, setNormalized] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [settingToken, setSettingToken] = useState(false);
  const { refresh } = useAuth();

  function normalizeInput(raw: string) {
    let val = raw.trim().toLowerCase();
    if (!val) return val;
    if (val.endsWith('.myshopify.com')) return val;
    if (val.includes('.')) return val;
    return val + '.myshopify.com';
  }

  async function launch() {
    setError(null);
    const candidate = normalizeInput(pendingShop);
    if (!candidate) {
      setError('Enter a shop domain');
      return;
    }
    try {
      const { authorize_url, normalized_shop_domain } = await startShopifyInstall(candidate);
      if (normalized_shop_domain) setNormalized(normalized_shop_domain);
      window.open(authorize_url, '_blank', 'noopener');
      setLaunched(true);
    } catch (e: any) {
      setError(e.message || 'Failed to start Shopify install');
    }
  }

  async function handleManualTokenSubmit() {
    if (!accessToken.trim()) {
      message.error('Please enter a valid access token');
      return;
    }

    setSettingToken(true);
    setError(null);
    try {
      await setTenantAccessToken(accessToken.trim());
      message.success('Access token saved successfully!');
      await refresh();
      onConnected();
    } catch (e: any) {
      setError(e.message || 'Failed to save access token');
    } finally {
      setSettingToken(false);
    }
  }

  async function recheck() {
    setChecking(true);
    setError(null);
    try {
      await tenantMe();
      await refresh();
      onConnected();
    } catch (e: any) {
      setError(e.message || 'Recheck failed - finish installation then try again');
    } finally {
      setChecking(false);
    }
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'oauth',
      label: 'OAuth Flow',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            Connect via OAuth to automatically authorize your Shopify store.
          </Typography.Paragraph>
          <Form layout="vertical" onFinish={launch} style={{ width: '100%' }}>
            <Form.Item label="Shop Domain" tooltip="You can enter either the short store name or full myshopify domain" required>
              <Input
                value={pendingShop}
                onChange={e => setPendingShop(e.target.value)}
                placeholder="e.g. mystore or mystore.myshopify.com"
                disabled={launched}
              />
            </Form.Item>
            {!launched && <Button type="primary" htmlType="submit" block>Connect with Shopify</Button>}
          </Form>
          {normalized && <Alert type="info" showIcon message={`Normalized to ${normalized}`} />}
          {launched && (
            <Space>
              <Button onClick={recheck} loading={checking} type="primary">Recheck</Button>
              <Button onClick={() => { setLaunched(false); setError(null); }}>Start Over</Button>
            </Space>
          )}
          {launched && <Alert type="info" showIcon message="Complete the authorization in the new tab, then click Recheck." />}
        </Space>
      ),
    },
    {
      key: 'manual',
      label: 'Manual Token',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            If you already have a Shopify access token, you can enter it directly below.
          </Typography.Paragraph>
          <Form layout="vertical" onFinish={handleManualTokenSubmit} style={{ width: '100%' }}>
            <Form.Item 
              label="Access Token" 
              tooltip="Your Shopify access token with read permissions for orders, customers, and products"
              required
            >
              <Input.Password
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                placeholder="Enter your Shopify access token"
                disabled={settingToken}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={settingToken}>
              Save Access Token
            </Button>
          </Form>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Card title="Connect Your Shopify Store" style={{ maxWidth: 560, width: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            This tenant has no connected Shopify store. Choose your preferred connection method below.
          </Typography.Paragraph>
          <Tabs items={tabItems} />
          {error && <Alert type="error" message={error} showIcon />}
        </Space>
      </Card>
    </div>
  );
}

export default TenantConnectShopify;