import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTenant, type NewTenant } from '../lib/api';
import { Form, Input, Button, Card, App } from 'antd';

const CreateTenantForm = () => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const { message } = App.useApp();

    const mutation = useMutation({
        mutationFn: (newTenant: NewTenant) => createTenant(newTenant),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            form.resetFields();
            message.success('Tenant created successfully!');
        },
        onError: (error) => {
            message.error(`Error: ${error.message}`);
        },
    });

    const handleSubmit = (values: { shopDomain: string; accessToken: string }) => {
        mutation.mutate({ shop_domain: values.shopDomain, access_token: values.accessToken });
    };

    return (
        <Card title="Create New Tenant">
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="shopDomain"
                    label="Shop Domain"
                    rules={[{ required: true, message: 'Please input the shop domain!' }]}
                >
                    <Input placeholder="e.g., your-store.myshopify.com" />
                </Form.Item>
                <Form.Item
                    name="accessToken"
                    label="Access Token"
                    rules={[{ required: true, message: 'Please input the access token!' }]}
                >
                    <Input.Password placeholder="Your Shopify admin API access token" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
                        Create Tenant
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateTenantForm;
               