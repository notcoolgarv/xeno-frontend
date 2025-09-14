import { useState, useEffect } from 'react';
import { Card, Space, Input, Button, Typography, Divider, List, Tag, App, Popconfirm, Alert, Tooltip } from 'antd';
import { generateTenantApiKey, listTenantApiKeys, revokeTenantApiKey, setApiKey, adminBootstrap, adminLogin, adminLogout, adminMe, listTenantUsers } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminPanelProps {
  tenantId: string | null;
}

const AdminPanel = ({ tenantId }: AdminPanelProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [lastCreatedKey, setLastCreatedKey] = useState<string | null>(null);
  const [usersVisible, setUsersVisible] = useState(false);
  const { message } = App.useApp();
  const qc = useQueryClient();
  const { refresh } = useAuth();
  function emitAdminLoggedIn() {
    window.dispatchEvent(new CustomEvent('xeno:admin-logged-in'));
  }

  const keysQuery = useQuery({
    queryKey: ['tenant-api-keys', tenantId],
    queryFn: () => listTenantApiKeys(tenantId as string),
    enabled: !!tenantId && !!sessionUser,
    retry: 0
  });

  const usersQuery = useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: () => listTenantUsers(tenantId as string),
    enabled: !!tenantId && !!sessionUser && usersVisible,
    retry: 0
  });

  useEffect(() => {
    adminMe().then(d => setSessionUser(d.user)).catch(() => setSessionUser(null));
  }, []);

  const genMutation = useMutation({
    mutationFn: () => generateTenantApiKey(tenantId as string, newKeyLabel || undefined),
    onSuccess: (data) => {
      setLastCreatedKey(data.api_key);
      setNewKeyLabel('');
      message.success('API key generated');
      qc.invalidateQueries({ queryKey: ['tenant-api-keys', tenantId] });
    },
    onError: (e: any) => message.error(e.message)
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => revokeTenantApiKey(tenantId as string, keyId),
    onSuccess: () => {
      message.success('Key revoked');
      qc.invalidateQueries({ queryKey: ['tenant-api-keys', tenantId] });
    },
    onError: (e: any) => message.error(e.message)
  });

  const authMutation = useMutation({
    mutationFn: async () => {
      if (mode === 'bootstrap') {
        return adminBootstrap(email, password);
      }
      return adminLogin(email, password);
    },
    onSuccess: async () => {
      message.success(mode === 'bootstrap' ? 'Admin user created' : 'Logged in');
      setPassword('');
      await refresh();
      try { const d = await adminMe(); setSessionUser(d.user); } catch {}
      qc.invalidateQueries({ queryKey: ['admin-me'] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
      emitAdminLoggedIn();
    },
    onError: (e: any) => message.error(e.message || 'Auth failed')
  });

  const logoutMutation = useMutation({
    mutationFn: () => adminLogout(),
    onSuccess: () => {
      message.success('Logged out');
      setSessionUser(null);
      qc.invalidateQueries({ queryKey: ['admin-me'] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (e: any) => message.error(e.message || 'Logout failed')
  });

  const handleUseKey = (key: string) => {
    setApiKey(key);
    message.success('Active API key set for tenant analytics');
  };

  return (
    <Card title="Admin & Key Management" size="small">
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {!sessionUser && (
          <>
            <Typography.Text strong>{mode === 'bootstrap' ? 'Bootstrap Admin' : 'Admin Login'}</Typography.Text>
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onPressEnter={() => authMutation.mutate()} />
            <Input.Password placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onPressEnter={() => authMutation.mutate()} />
            <Space>
              <Button type="primary" loading={authMutation.isPending} onClick={() => authMutation.mutate()}>
                {mode === 'bootstrap' ? 'Create & Login' : 'Login'}
              </Button>
              <Button type="link" onClick={() => setMode(mode === 'bootstrap' ? 'login' : 'bootstrap')}>
                {mode === 'bootstrap' ? 'Have admin? Login' : 'First time? Bootstrap'}
              </Button>
            </Space>
            <Alert type="info" showIcon message={mode === 'bootstrap' ? 'Create the first admin user' : 'Enter your admin credentials'} />
          </>
        )}
        {sessionUser && (
          <Alert
            type="success"
            message={<Space direction="vertical" size={0}><span>Logged in as <strong>{sessionUser.email}</strong></span><Button size="small" onClick={() => logoutMutation.mutate()} loading={logoutMutation.isPending}>Logout</Button></Space>} />
        )}
        <Divider style={{ margin: '8px 0' }} />
        {tenantId && sessionUser ? (
          <>
            <Typography.Text strong>Generate API Key for Selected Tenant</Typography.Text>
            <Input
              placeholder="Label (optional)"
              value={newKeyLabel}
              onChange={e => setNewKeyLabel(e.target.value)}
              onPressEnter={() => genMutation.mutate()}
            />
            <Button type="primary" disabled={!sessionUser} loading={genMutation.isPending} onClick={() => genMutation.mutate()}>
              Generate Key
            </Button>
            {lastCreatedKey && (
              <Alert
                type="success"
                message={
                  <div style={{ fontFamily: 'monospace' }}>
                    Raw Key (copy now, won't be shown again):<br />
                    <Tooltip title="Click to copy">
                      <span style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(lastCreatedKey!); message.success('Copied'); }}>{lastCreatedKey}</span>
                    </Tooltip>
                  </div>
                }
                closable
                onClose={() => setLastCreatedKey(null)}
              />
            )}
            <Divider style={{ margin: '8px 0' }} />
            <Typography.Text strong>Existing Keys</Typography.Text>
            <List
              size="small"
              loading={keysQuery.isLoading}
              dataSource={keysQuery.data || []}
              locale={{ emptyText: 'No keys yet' }}
              renderItem={(k: any) => (
                <List.Item
                  actions={[
                    <Button key="use" size="small" onClick={() => handleUseKey('[hidden key raw not stored]')} disabled>
                      Use
                    </Button>,
                    !k.revoked_at ? (
                      <Popconfirm key="revoke" title="Revoke this key?" onConfirm={() => revokeMutation.mutate(k.id)}>
                        <Button danger size="small" loading={revokeMutation.isPending}>Revoke</Button>
                      </Popconfirm>
                    ) : <Tag key="revoked" color="red">revoked</Tag>
                  ]}
                >
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <span>{k.label || '(no label)'} {k.revoked_at && <Tag color="red">revoked</Tag>}</span>
                    <span style={{ fontSize: 10 }} className="text-subtle">Created: {new Date(k.created_at).toLocaleString()} {k.last_used_at && `| Last used: ${new Date(k.last_used_at).toLocaleString()}`}</span>
                  </Space>
                </List.Item>
              )}
              style={{ maxHeight: 200, overflowY: 'auto' }}
            />
            <Alert type="info" showIcon style={{ marginTop: 8 }} message="Raw key cannot be recovered after generation." />
            <Divider style={{ margin: '8px 0' }} />
            <Space direction="horizontal" style={{ justifyContent: 'space-between', width: '100%' }}>
              <Typography.Text strong>Tenant Users</Typography.Text>
              <Button size="small" type="link" onClick={() => setUsersVisible(v => !v)}>{usersVisible ? 'Hide' : 'Show'}</Button>
            </Space>
            {usersVisible && (
              <List
                size="small"
                loading={usersQuery.isLoading}
                dataSource={usersQuery.data || []}
                locale={{ emptyText: 'No users yet' }}
                renderItem={(u: any) => (
                  <List.Item>
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <span>{u.email} <Tag>{u.role}</Tag></span>
                      <span className="text-subtle" style={{ fontSize: 10 }}>Created: {new Date(u.created_at).toLocaleString()}</span>
                    </Space>
                  </List.Item>
                )}
                style={{ maxHeight: 180, overflowY: 'auto' }}
              />
            )}
          </>
        ) : (!tenantId ? <Alert type="info" message="Select a tenant to manage API keys" /> : !sessionUser && <Alert type="warning" message="Login to manage API keys" />)}
      </Space>
    </Card>
  );
};

export default AdminPanel;