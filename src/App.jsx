import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { UserOutlined, AppstoreOutlined } from '@ant-design/icons';
import DanhSachGiaoVien from './pages/DanhSachGiaoVien';
import DanhSachViTri from './pages/DanhSachViTri';

const { Header, Content, Sider } = Layout;

function App() {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/',
      icon: <UserOutlined />,
      label: 'Danh sách giáo viên'
    },
    {
      key: '/vi-tri',
      icon: <AppstoreOutlined />,
      label: 'Danh sách vị trí công tác'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Hệ thống quản lý giáo viên</h1>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['/']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Routes>
            <Route path="/" element={<DanhSachGiaoVien />} />
            <Route path="/vi-tri" element={<DanhSachViTri />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;

