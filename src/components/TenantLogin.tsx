import { useState } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Divider } from 'antd';
import { setTenantBasicAuth, clearTenantBasicAuth, tenantMe, lookupTenant, startShopifyInstall } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface TenantLoginProps { onAuthenticated: (tenantId: string) => void; }

export function TenantLogin({ onAuthenticated }: TenantLoginProps) {
  const [shop, setShop] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupState, setLookupState] = useState<'idle' | 'searching' | 'not-found' | 'found' | 'needs-connect'>('idle');
  const [tenantMeta, setTenantMeta] = useState<{ id: string; shop_domain: string; has_access_token: boolean } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [postInstallCheck, setPostInstallCheck] = useState(false);
  const qc = useQueryClient();
  const { refresh } = useAuth();

  async function attempt() {
    setError(null);
    setLoading(true);
    try {
      setTenantBasicAuth(email.trim(), password);
      const me = await tenantMe();
      if (!me.tenant.has_access_token) {
        setLookupState('needs-connect');
        setTenantMeta({ id: me.tenant.id, shop_domain: me.tenant.shop_domain, has_access_token: false });
      } else {
        onAuthenticated(me.tenant.id);
      }
      await refresh();
      qc.invalidateQueries({ queryKey: ['tenant-me'] });
      qc.invalidateQueries({ queryKey: ['analytics', me.tenant.id] });
      setPassword('');
    } catch (e: any) {
      clearTenantBasicAuth();
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function doLookup() {
    setError(null);
    setLookupState('searching');
    try {
      const s = shop.trim().toLowerCase();
      if (!s.endsWith('.myshopify.com')) {
        setError('Shop domain must end with .myshopify.com');
        setLookupState('idle');
        return;
      }
      const result = await lookupTenant(s);
      if (!result.exists) {
        setLookupState('not-found');
        setTenantMeta(null);
        return;
      }
      setTenantMeta(result.tenant!);
      setLookupState(result.tenant!.has_access_token ? 'found' : 'needs-connect');
    } catch (e: any) {
      setError(e.message || 'Lookup failed');
      setLookupState('idle');
    }
  }

  async function connectShopify() {
    if (!tenantMeta) return;
    setConnecting(true);
    try {
      const { authorize_url } = await startShopifyInstall(tenantMeta.shop_domain);
      window.open(authorize_url, '_blank', 'noopener');
      setPostInstallCheck(true);
    } catch (e: any) {
      setError(e.message || 'Failed to start Shopify install');
    } finally {
      setConnecting(false);
    }
  }

  async function recheckAfterInstall() {
    try {
      const me = await tenantMe();
      if (me.tenant.has_access_token) {
        onAuthenticated(me.tenant.id);
      } else {
        setError('Still not connected. Finish the Shopify authorization then click Recheck.');
      }
    } catch (e: any) {
      setError(e.message || 'Recheck failed');
    }
  }

  return (
    <Card title="Tenant Login / Connect" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {error && <Alert type="error" message={error} showIcon />}
        <Typography.Text strong>1. Enter your Shopify shop domain</Typography.Text>
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder="example-store.myshopify.com" value={shop} onChange={e => setShop(e.target.value)} onPressEnter={doLookup} />
          <Button onClick={doLookup} loading={lookupState==='searching'} type="default">Lookup</Button>
        </Space.Compact>
        {lookupState === 'not-found' && <Alert type="warning" showIcon message="No tenant initialized for this shop. Contact admin." />}
        {lookupState === 'found' && <Alert type="success" showIcon message="Shop recognized and already connected. Proceed to login below." />}
        {lookupState === 'needs-connect' && <Alert type="info" showIcon message="Shop recognized but not connected to Shopify yet." />}
        {(lookupState === 'found' || lookupState === 'needs-connect') && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Typography.Text strong>2. Tenant User Login</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>Use the credentials provided by your admin.</Typography.Text>
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onPressEnter={attempt} />
            <Input.Password placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onPressEnter={attempt} />
            <Button type="primary" loading={loading} disabled={!email || !password} onClick={attempt}>Login</Button>
          </>
        )}
        {lookupState === 'needs-connect' && tenantMeta && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Typography.Text strong>3. Connect Shopify Store</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
              After logging in, connect your store to begin data ingestion.
            </Typography.Paragraph>
            <Button onClick={connectShopify} loading={connecting} type="dashed">Connect with Shopify</Button>
            {postInstallCheck && (
              <Button style={{ marginLeft: 8 }} onClick={recheckAfterInstall} type="default">Recheck</Button>
            )}
          </>
        )}
      </Space>
    </Card>
  );
}
