import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import styled from 'styled-components';
import { Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
`;

const Form = styled.form`
  display: grid;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  input {
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid ${props => props.variant === 'primary' ? '#007bff' : '#ddd'};
  background: ${props => props.variant === 'primary' ? '#007bff' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#666'};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#0056b3' : '#f8f9fa'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    lang: 'zh',
    region: '',
    timezone: 'Asia/Shanghai',
  });

  const [notificationData, setNotificationData] = useState({
    morningTime: '07:30',
    eveningTime: '19:30',
    channelEmail: true,
    channelPush: true,
    channelWebpush: true,
    breakingEnabled: true,
    maxItemsPerDigest: 20,
  });

  const { data: notificationSettings, isLoading } = useQuery(
    'notification-settings',
    notificationsAPI.getSettings
  );

  const updateNotificationsMutation = useMutation(notificationsAPI.updateSettings, {
    onSuccess: () => {
      toast.success('通知设置已更新');
    },
    onError: () => {
      toast.error('更新失败');
    },
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        lang: user.lang,
        region: user.region || '',
        timezone: user.timezone,
      });
    }
  }, [user]);

  useEffect(() => {
    if (notificationSettings) {
      setNotificationData(notificationSettings);
    }
  }, [notificationSettings]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notificationData);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Title>设置</Title>

      <Section>
        <SectionTitle>个人信息</SectionTitle>
        <Form onSubmit={handleProfileSubmit}>
          <FormGroup>
            <Label>邮箱</Label>
            <Input type="email" value={user?.email || ''} disabled />
          </FormGroup>

          <FormGroup>
            <Label>姓名</Label>
            <Input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>语言</Label>
            <Select
              value={profileData.lang}
              onChange={(e) => setProfileData(prev => ({ ...prev, lang: e.target.value }))}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>地区</Label>
            <Input
              type="text"
              value={profileData.region}
              onChange={(e) => setProfileData(prev => ({ ...prev, region: e.target.value }))}
              placeholder="例如: CN, US"
            />
          </FormGroup>

          <FormGroup>
            <Label>时区</Label>
            <Select
              value={profileData.timezone}
              onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
            >
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </Select>
          </FormGroup>

          <ButtonGroup>
            <Button type="submit" variant="primary">
              <Save />
              保存个人信息
            </Button>
          </ButtonGroup>
        </Form>
      </Section>

      <Section>
        <SectionTitle>通知设置</SectionTitle>
        <Form onSubmit={handleNotificationSubmit}>
          <FormGroup>
            <Label>晨间推送时间</Label>
            <Input
              type="time"
              value={notificationData.morningTime}
              onChange={(e) => setNotificationData(prev => ({ ...prev, morningTime: e.target.value }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>晚间推送时间</Label>
            <Input
              type="time"
              value={notificationData.eveningTime}
              onChange={(e) => setNotificationData(prev => ({ ...prev, eveningTime: e.target.value }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>每日摘要最大条数</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={notificationData.maxItemsPerDigest}
              onChange={(e) => setNotificationData(prev => ({ ...prev, maxItemsPerDigest: parseInt(e.target.value) }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>推送渠道</Label>
            <CheckboxGroup>
              <CheckboxItem>
                <input
                  type="checkbox"
                  checked={notificationData.channelEmail}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, channelEmail: e.target.checked }))}
                />
                邮件推送
              </CheckboxItem>
              
              <CheckboxItem>
                <input
                  type="checkbox"
                  checked={notificationData.channelPush}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, channelPush: e.target.checked }))}
                />
                移动推送
              </CheckboxItem>
              
              <CheckboxItem>
                <input
                  type="checkbox"
                  checked={notificationData.channelWebpush}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, channelWebpush: e.target.checked }))}
                />
                网页推送
              </CheckboxItem>
              
              <CheckboxItem>
                <input
                  type="checkbox"
                  checked={notificationData.breakingEnabled}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, breakingEnabled: e.target.checked }))}
                />
                突发新闻推送
              </CheckboxItem>
            </CheckboxGroup>
          </FormGroup>

          <ButtonGroup>
            <Button 
              type="submit" 
              variant="primary"
              disabled={updateNotificationsMutation.isLoading}
            >
              <Save />
              {updateNotificationsMutation.isLoading ? '保存中...' : '保存通知设置'}
            </Button>
          </ButtonGroup>
        </Form>
      </Section>
    </Container>
  );
};

export default SettingsPage;