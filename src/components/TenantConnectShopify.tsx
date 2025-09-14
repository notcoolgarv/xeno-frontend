import { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Input, Form } from 'antd';
import { startShopifyInstall, tenantMe } from '../lib/api';
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Card title="Connect Your Shopify Store" style={{ maxWidth: 560, width: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            This tenant has no connected Shopify store. Provide your shop domain to begin OAuth authorization.
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
          {error && <Alert type="error" message={error} showIcon />}
          {launched && (
            <Space>
              <Button onClick={recheck} loading={checking} type="primary">Recheck</Button>
              <Button onClick={() => { setLaunched(false); setError(null); }}>Start Over</Button>
            </Space>
          )}
          {launched && <Alert type="info" showIcon message="Complete the authorization in the new tab, then click Recheck." />}
        </Space>
      </Card>
    </div>
  );
}

export default TenantConnectShopify;