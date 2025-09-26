import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { subscriptionsAPI, sourcesAPI } from '../services/api';
import { Subscription } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SubscriptionGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
`;

const SubscriptionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SubscriptionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const SubscriptionName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const SubscriptionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.edit {
    color: #007bff;
  }
  
  &.delete {
    color: #dc3545;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SubscriptionMeta = styled.div`
  display: grid;
  gap: 12px;
  font-size: 14px;
  color: #666;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  
  strong {
    color: #333;
    min-width: 80px;
  }
`;

const TagList = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #f8f9ff;
  color: #007bff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const Modal = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
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
`;

const SubscriptionsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    topicCodes: '',
    sourceCodes: '',
    priority: 5,
    dailyLimit: 30,
  });

  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery(
    'subscriptions',
    subscriptionsAPI.getSubscriptions
  );

  const { data: sources } = useQuery('sources', sourcesAPI.getSources);
  const { data: topics } = useQuery('topics', sourcesAPI.getTopics);

  const createMutation = useMutation(subscriptionsAPI.createSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      setShowModal(false);
      toast.success('订阅创建成功');
    },
    onError: () => toast.error('创建失败'),
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Subscription> }) =>
      subscriptionsAPI.updateSubscription(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscriptions');
        setShowModal(false);
        toast.success('订阅更新成功');
      },
      onError: () => toast.error('更新失败'),
    }
  );

  const deleteMutation = useMutation(subscriptionsAPI.deleteSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      toast.success('订阅删除成功');
    },
    onError: () => toast.error('删除失败'),
  });

  const handleAdd = () => {
    setEditingSubscription(null);
    setFormData({
      name: '',
      keywords: '',
      topicCodes: '',
      sourceCodes: '',
      priority: 5,
      dailyLimit: 30,
    });
    setShowModal(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      keywords: subscription.keywords.join(', '),
      topicCodes: subscription.topicCodes.join(', '),
      sourceCodes: subscription.sourceCodes.join(', '),
      priority: subscription.priority,
      dailyLimit: subscription.dailyLimit,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      topicCodes: formData.topicCodes.split(',').map(t => t.trim()).filter(t => t),
      sourceCodes: formData.sourceCodes.split(',').map(s => s.trim()).filter(s => s),
      priority: formData.priority,
      dailyLimit: formData.dailyLimit,
    };

    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个订阅吗？')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>订阅管理</Title>
        <AddButton onClick={handleAdd}>
          <Plus />
          新建订阅
        </AddButton>
      </Header>

      <SubscriptionGrid>
        {subscriptions?.items?.map(subscription => (
          <SubscriptionCard key={subscription.id}>
            <SubscriptionHeader>
              <SubscriptionName>{subscription.name}</SubscriptionName>
              <SubscriptionActions>
                <ActionButton
                  className="edit"
                  onClick={() => handleEdit(subscription)}
                >
                  <Edit2 />
                </ActionButton>
                <ActionButton
                  className="delete"
                  onClick={() => handleDelete(subscription.id)}
                >
                  <Trash2 />
                </ActionButton>
              </SubscriptionActions>
            </SubscriptionHeader>

            <SubscriptionMeta>
              <MetaRow>
                <strong>优先级:</strong>
                <span>{subscription.priority}</span>
              </MetaRow>
              
              <MetaRow>
                <strong>每日限额:</strong>
                <span>{subscription.dailyLimit} 篇</span>
              </MetaRow>

              {subscription.keywords.length > 0 && (
                <MetaRow>
                  <strong>关键词:</strong>
                  <TagList>
                    {subscription.keywords.map(keyword => (
                      <Tag key={keyword}>{keyword}</Tag>
                    ))}
                  </TagList>
                </MetaRow>
              )}

              {subscription.topicCodes.length > 0 && (
                <MetaRow>
                  <strong>主题:</strong>
                  <TagList>
                    {subscription.topicCodes.map(topic => (
                      <Tag key={topic}>{topic}</Tag>
                    ))}
                  </TagList>
                </MetaRow>
              )}

              {subscription.sourceCodes.length > 0 && (
                <MetaRow>
                  <strong>来源:</strong>
                  <TagList>
                    {subscription.sourceCodes.map(source => (
                      <Tag key={source}>{source}</Tag>
                    ))}
                  </TagList>
                </MetaRow>
              )}
            </SubscriptionMeta>
          </SubscriptionCard>
        ))}
      </SubscriptionGrid>

      <Modal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingSubscription ? '编辑订阅' : '新建订阅'}
            </ModalTitle>
            <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>订阅名称</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>关键词（用逗号分隔）</Label>
              <Input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="例如: AI, 人工智能, 机器学习"
              />
            </FormGroup>

            <FormGroup>
              <Label>主题代码（用逗号分隔）</Label>
              <Input
                type="text"
                value={formData.topicCodes}
                onChange={(e) => setFormData(prev => ({ ...prev, topicCodes: e.target.value }))}
                placeholder="例如: tech, ai, business"
              />
            </FormGroup>

            <FormGroup>
              <Label>来源代码（用逗号分隔）</Label>
              <Input
                type="text"
                value={formData.sourceCodes}
                onChange={(e) => setFormData(prev => ({ ...prev, sourceCodes: e.target.value }))}
                placeholder="例如: techcrunch, 36kr"
              />
            </FormGroup>

            <FormGroup>
              <Label>优先级 (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </FormGroup>

            <FormGroup>
              <Label>每日限额</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.dailyLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="button" onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button type="submit" variant="primary">
                {editingSubscription ? '更新' : '创建'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SubscriptionsPage;