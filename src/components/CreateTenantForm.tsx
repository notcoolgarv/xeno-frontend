import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createTenant, initTenant } from '../lib/api';
import { Form, Input, Button, Card, App, Switch, Alert, Typography, Divider, Space } from 'antd';

const UnifiedTenantForm = () => {
    const qc = useQueryClient();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [createUser, setCreateUser] = useState(true);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ['tenants'] });
    };

    const handleSubmit = async () => {
        setGeneratedPassword(null);
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            const shop_domain: string = values.shopDomain.trim().toLowerCase();
            const access_token: string | undefined = values.accessToken ? values.accessToken.trim() : undefined;
            if (createUser) {
                const user_email: string = values.userEmail.trim().toLowerCase();
                const resp = await initTenant({ shop_domain, access_token, user_email });
                setGeneratedPassword(resp.password);
                message.success('Tenant + first user created');
            } else {
                await createTenant({ shop_domain, access_token });
                message.success('Tenant created');
            }
            form.resetFields(['shopDomain', 'accessToken', 'userEmail']);
            invalidate();
        } catch (e: any) {
            if (e?.errorFields) return;
            message.error(e.message || 'Creation failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card title="Tenant Onboarding" extra={<Space><span style={{ fontSize:12 }}>Create initial user</span><Switch size="small" checked={createUser} onChange={setCreateUser} /></Space>}>
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <Form.Item name="shopDomain" label="Shop Domain" rules={[{ required: true, message: 'Shop domain required' }]}> 
                    <Input placeholder="acme-store.myshopify.com or acme-store" />
                </Form.Item>
                <Form.Item name="accessToken" label={<span>Access Token <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>(optional now, will be set by OAuth)</Typography.Text></span>}>
                    <Input.Password placeholder="(Optional) existing private app token" />
                </Form.Item>
                {createUser && (
                    <Form.Item name="userEmail" label="Initial User Email" rules={[{ required: true, message: 'User email required' }]}> 
                        <Input placeholder="owner@acme.com" />
                    </Form.Item>
                )}
                <Alert type="info" showIcon style={{ marginBottom: 12 }} message={
                    <div style={{ fontSize:12, lineHeight:1.4 }}>
                        <div>Provide an access token only if you already have one; otherwise connect later via Shopify OAuth.</div>
                        {createUser ? <div>A strong password will be generated and shown exactly once.</div> : <div>You can add users later from the Users section.</div>}
                    </div>
                } />
                <Button type="primary" htmlType="submit" loading={submitting} block>
                    {createUser ? 'Create Tenant + User' : 'Create Tenant'}
                </Button>
                {generatedPassword && (
                    <>
                        <Divider />
                        <Alert type="success" showIcon message={<div style={{ fontSize:13 }}>Initial password (copy now): <code style={{ userSelect:'all' }}>{generatedPassword}</code></div>} closable onClose={() => setGeneratedPassword(null)} />
                    </>
                )}
            </Form>
        </Card>
    );
};

export default UnifiedTenantForm;
               