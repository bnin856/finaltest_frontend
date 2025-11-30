import { useState, useEffect } from 'react';
import { Table, Button, Space, Drawer, Form, Input, message, Tag, Card, Segmented, Dropdown } from 'antd';
import { PlusOutlined, ReloadOutlined, MoreOutlined, SaveOutlined } from '@ant-design/icons';
import { positionAPI } from '../services/api';

function DanhSachViTri() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await positionAPI.getAll();
      setPositions(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách vị trí công tác');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await positionAPI.create(values);
      message.success('Tạo vị trí công tác thành công');
      setDrawerVisible(false);
      form.resetFields();
      fetchPositions();
    } catch (error) {
      message.error(error.response?.data?.error || 'Lỗi khi tạo vị trí công tác');
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 80,
      render: (_, __, index) => {
        return index + 1;
      }
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'} style={{ borderRadius: '4px', padding: '4px 12px' }}>
          {isActive ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'des',
      key: 'des'
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Chỉnh sửa' },
              { key: 'delete', label: 'Xóa', danger: true }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Danh sách vị trí làm việc (công tác) của giáo viên</h2>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => fetchPositions()}
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setDrawerVisible(true)}
            >
              + Tạo
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={positions}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>

      <Drawer
        title="Vị trí công tác"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleSubmit({
              ...values,
              isActive: values.status === 'active'
            });
          }}
          initialValues={{
            status: 'active'
          }}
        >
          <Form.Item
            label={<span>* Mã</span>}
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã vị trí' }]}
          >
            <Input placeholder="Nhập mã vị trí" />
          </Form.Item>

          <Form.Item
            label={<span>* Tên</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
          >
            <Input placeholder="Nhập tên vị trí" />
          </Form.Item>

          <Form.Item
            label={<span>* Mô tả</span>}
            name="des"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item
            label={<span>* Trạng thái</span>}
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Segmented
              options={[
                { label: 'Hoạt động', value: 'active' },
                { label: 'Ngừng', value: 'inactive' }
              ]}
              block
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default DanhSachViTri;

