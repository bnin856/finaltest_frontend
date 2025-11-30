import { useState, useEffect } from 'react';
import { Table, Button, Space, Drawer, Form, Input, DatePicker, Select, Switch, message, Tag, Card, Avatar, Divider } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons';
import { teacherAPI, positionAPI } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;

function DanhSachGiaoVien() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [positions, setPositions] = useState([]);
  const [degrees, setDegrees] = useState([{ type: '', school: '', major: '', year: '', isGraduated: true }]);

  useEffect(() => {
    fetchTeachers();
    fetchPositions();
  }, []);

  const fetchTeachers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await teacherAPI.getAll(page, limit);
      setTeachers(response.data.teachers);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await positionAPI.getAll();
      setPositions(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách vị trí');
    }
  };

  const handleTableChange = (newPagination) => {
    fetchTeachers(newPagination.current, newPagination.pageSize);
  };

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        teacherPositions: values.teacherPositions || [],
        degrees: degrees.filter(d => d.type && d.school && d.major)
      };
      
      await teacherAPI.create(submitData);
      message.success('Tạo giáo viên thành công');
      setDrawerVisible(false);
      form.resetFields();
      setDegrees([{ type: '', school: '', major: '', year: '', isGraduated: true }]);
      fetchTeachers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.error || 'Lỗi khi tạo giáo viên');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 130
    },
    {
      title: 'Giáo viên',
      key: 'giaoVien',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.ten}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.sdt}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Trình độ (cao nhất)',
      key: 'trinhDo',
      width: 200,
      render: (_, record) => {
        if (!record.hocVan || record.hocVan.length === 0) {
          return <span>N/A</span>;
        }
        const highestDegree = record.hocVan[record.hocVan.length - 1];
        return (
          <div>
            <div><strong>Bậc:</strong> {highestDegree.trinhDo}</div>
            <div><strong>Chuyên ngành:</strong> {highestDegree.chuyenNganh}</div>
          </div>
        );
      }
    },
    {
      title: 'Bộ môn',
      key: 'boMon',
      width: 120,
      render: () => <span>N/A</span>
    },
    {
      title: 'TT Công tác',
      dataIndex: 'viTriCongTac',
      key: 'viTriCongTac',
      width: 150
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'diaChi',
      key: 'diaChi',
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiHoatDong',
      key: 'trangThaiHoatDong',
      width: 130,
      render: (text) => (
        <Tag color={text === 'Đang hoạt động' ? 'green' : 'red'}>
          {text === 'Đang hoạt động' ? 'Đang công tác' : 'Ngừng công tác'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 100,
      render: () => (
        <Button type="link" icon={<MoreOutlined />}>Chi tiết</Button>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Danh sách giáo viên</h2>
          <Space>
            <Input
              placeholder="Tìm kiếm thông tin"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => fetchTeachers(pagination.current, pagination.pageSize)}
            >
              Tải lại
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setDrawerVisible(true)}
            >
              Tạo mới
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng: ${total}`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showQuickJumper: true
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Drawer
        title="Tạo thông tin giáo viên"
        placement="right"
        width={700}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setDegrees([{ type: '', school: '', major: '', year: '', isGraduated: true }]);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Thông tin cá nhân</h3>
            
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={100} icon={<UserOutlined />} />
              <div style={{ marginTop: 8 }}>
                <Button type="link">Upload file</Button>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Chọn ảnh</div>
              </div>
            </div>

            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="VD: Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="dob"
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="example@school.edu.vn" />
            </Form.Item>

            <Form.Item
              label="Số CCCD"
              name="identity"
              rules={[{ required: true, message: 'Vui lòng nhập số CCCD' }]}
            >
              <Input placeholder="Nhập số CCCD" />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input placeholder="Địa chỉ thường trú" />
            </Form.Item>
          </div>

          <Divider />

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Thông tin công tác</h3>
            
            <Form.Item
              label="Vị trí công tác"
              name="teacherPositions"
            >
              <Select mode="multiple" placeholder="Chọn các vị trí công tác">
                {positions.map(pos => (
                  <Option key={pos._id} value={pos._id}>{pos.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày bắt đầu công tác"
              name="startDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Ngày kết thúc công tác"
              name="endDate"
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Trạng thái hoạt động"
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </div>

          <Divider />

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Học vị</h3>

            <Table
              dataSource={degrees}
              columns={[
                {
                  title: 'Bậc',
                  key: 'type',
                  render: (_, record, index) => (
                    <Input
                      placeholder="Nhập bậc"
                      value={record.type}
                      onChange={(e) => {
                        const newDegrees = [...degrees];
                        newDegrees[index].type = e.target.value;
                        setDegrees(newDegrees);
                      }}
                    />
                  )
                },
                {
                  title: 'Trường',
                  key: 'school',
                  render: (_, record, index) => (
                    <Input
                      placeholder="Nhập tên trường"
                      value={record.school}
                      onChange={(e) => {
                        const newDegrees = [...degrees];
                        newDegrees[index].school = e.target.value;
                        setDegrees(newDegrees);
                      }}
                    />
                  )
                },
                {
                  title: 'Chuyên ngành',
                  key: 'major',
                  render: (_, record, index) => (
                    <Input
                      placeholder="Nhập chuyên ngành"
                      value={record.major}
                      onChange={(e) => {
                        const newDegrees = [...degrees];
                        newDegrees[index].major = e.target.value;
                        setDegrees(newDegrees);
                      }}
                    />
                  )
                },
                {
                  title: 'Năm',
                  key: 'year',
                  render: (_, record, index) => (
                    <Input
                      placeholder="Năm"
                      type="number"
                      value={record.year}
                      onChange={(e) => {
                        const newDegrees = [...degrees];
                        newDegrees[index].year = e.target.value;
                        setDegrees(newDegrees);
                      }}
                    />
                  )
                },
                {
                  title: 'Tốt nghiệp',
                  key: 'isGraduated',
                  render: (_, record, index) => (
                    <Switch
                      checked={record.isGraduated}
                      onChange={(checked) => {
                        const newDegrees = [...degrees];
                        newDegrees[index].isGraduated = checked;
                        setDegrees(newDegrees);
                      }}
                    />
                  )
                }
              ]}
              pagination={false}
              rowKey={(record, index) => index}
              size="small"
            />
            <Button
              type="dashed"
              onClick={() => {
                setDegrees([...degrees, { type: '', school: '', major: '', year: '', isGraduated: true }]);
              }}
              style={{ marginTop: 8 }}
            >
              Thêm
            </Button>
          </div>

          <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default DanhSachGiaoVien;

