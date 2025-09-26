import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Home, Settings, Bookmark, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 250px;
  background: white;
  border-right: 1px solid #e9ecef;
  padding: 20px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
`;

const Logo = styled.div`
  padding: 0 20px 20px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 20px;
  
  h1 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
`;

const Nav = styled.nav`
  padding: 0 10px;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 4px 0;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.$active ? '#007bff' : '#666'};
  background: ${props => props.$active ? '#f8f9ff' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
    color: #007bff;
  }
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  margin: 4px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
    color: #dc3545;
  }
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-left: 250px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Layout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: '新闻订阅' },
    { path: '/subscriptions', icon: Bookmark, label: '订阅管理' },
    { path: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <h1>新闻订阅系统</h1>
        </Logo>
        
        <Nav>
          {navItems.map(item => (
            <NavItem
              key={item.path}
              to={item.path}
              $active={location.pathname === item.path}
            >
              <item.icon />
              {item.label}
            </NavItem>
          ))}
          
          <LogoutButton onClick={logout}>
            <LogOut />
            退出登录
          </LogoutButton>
        </Nav>
      </Sidebar>
      
      <Main>
        <Outlet />
      </Main>
    </LayoutContainer>
  );
};

export default Layout;