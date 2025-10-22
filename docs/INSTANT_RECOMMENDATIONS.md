# 即时推荐功能

## 功能概述

当用户完成订阅设置（创建、更新或删除订阅）后，系统会立即触发个性化推荐引擎，为用户获取匹配的文章并自动刷新主页面显示。

## 工作流程

### 1. 后端实现

#### 订阅控制器增强
`backend/src/subscriptions/subscriptions.controller.ts`

- **创建订阅后触发推荐**：
  ```typescript
  @Post()
  async create(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionsService.create(req.user.userId, createSubscriptionDto);
    
    // 在后台触发即时推荐刷新
    this.refreshUserRecommendations(req.user.userId).catch(err => 
      console.error('Failed to refresh recommendations:', err)
    );
    
    return subscription;
  }
  ```

- **更新订阅后触发推荐**：
  ```typescript
  @Patch(':id')
  async update(...) {
    const subscription = await this.subscriptionsService.update(...);
    
    // 触发即时推荐刷新
    this.refreshUserRecommendations(req.user.userId).catch(...);
    
    return subscription;
  }
  ```

#### 新增API端点
- **路径**: `GET /api/v1/subscriptions/recommendations/instant`
- **功能**: 获取基于用户订阅的即时个性化推荐
- **认证**: 需要JWT令牌
- **返回**: 个性化文章列表（最近7天内的文章）

#### 推荐算法
使用现有的个性化排序系统：
- 获取最近7天的文章
- 基于用户订阅的关键词、主题、来源进行匹配
- 使用个性化评分和多样性算法
- 返回最相关的20篇文章

### 2. 前端实现

#### 订阅页面增强
`frontend/src/pages/SubscriptionsPage.tsx`

订阅操作成功后自动刷新feed查询：

```typescript
const createMutation = useMutation(subscriptionsAPI.createSubscription, {
  onSuccess: () => {
    queryClient.invalidateQueries('subscriptions');
    // 使feed查询失效，触发重新获取
    queryClient.invalidateQueries('feed');
    queryClient.invalidateQueries('search');
    toast.success('订阅创建成功！正在为您获取相关内容...');
  },
});

const updateMutation = useMutation(..., {
  onSuccess: () => {
    queryClient.invalidateQueries('subscriptions');
    queryClient.invalidateQueries('feed');
    queryClient.invalidateQueries('search');
    toast.success('订阅更新成功！正在刷新您的内容...');
  },
});
```

#### 用户体验流程

1. 用户在订阅页面创建或更新订阅
2. 系统显示成功提示："订阅创建成功！正在为您获取相关内容..."
3. 后端自动在后台触发个性化推荐计算
4. 前端自动使feed缓存失效
5. 用户返回主页面时，React Query自动重新获取feed数据
6. 主页面显示基于新订阅设置的个性化内容

## 技术特点

### 1. 非阻塞设计
- 后端推荐刷新在后台异步执行
- 不会阻塞订阅创建/更新的响应
- 即使推荐刷新失败，也不影响订阅操作

### 2. 缓存失效策略
- 使用React Query的`invalidateQueries`
- 自动触发相关查询的重新获取
- 确保用户看到最新的个性化内容

### 3. 个性化算法
- 基于订阅的关键词匹配
- 主题和来源偏好
- 时效性考虑（最近7天）
- 多样性保证

## 测试

### E2E测试
`tests/e2e/instant-recommendations.spec.ts`

测试场景：
1. 用户注册/登录
2. 查看初始feed状态
3. 创建新订阅（包含特定关键词和主题）
4. 返回主页面
5. 验证feed已更新

运行测试：
```bash
npm run e2e
```

### 手动测试步骤

1. 登录系统
2. 访问主页面，注意当前显示的文章
3. 进入"订阅管理"页面
4. 创建新订阅，设置关键词（如：AI, 人工智能, 科技）
5. 点击创建，看到成功提示
6. 返回主页面
7. 观察feed是否自动刷新并显示相关内容

## 性能优化

### 后端优化
- 异步执行推荐计算，不阻塞响应
- 限制推荐文章的时间范围（7天）
- 限制返回文章数量（20篇）

### 前端优化
- 使用React Query的智能缓存
- 只在订阅变更时才刷新feed
- 避免不必要的重复请求

## 未来改进方向

1. **实时通知**
   - 使用WebSocket推送新匹配的文章
   - 在主页面显示"新内容可用"提示

2. **增量更新**
   - 只获取新增的匹配文章
   - 而不是完全刷新整个feed

3. **智能预加载**
   - 在用户编辑订阅时预测并预加载可能的推荐
   - 提供更快的响应体验

4. **推荐解释**
   - 显示文章推荐的原因（匹配了哪个订阅）
   - 帮助用户理解和优化订阅设置

## 相关文件

### 后端
- `backend/src/subscriptions/subscriptions.controller.ts` - 订阅控制器
- `backend/src/subscriptions/subscriptions.module.ts` - 订阅模块配置
- `backend/src/articles/articles.service.ts` - 文章服务
- `backend/src/ranking/ranking.service.ts` - 排序服务
- `backend/src/ranking/personalization.service.ts` - 个性化服务

### 前端
- `frontend/src/pages/SubscriptionsPage.tsx` - 订阅管理页面
- `frontend/src/pages/FeedPage.tsx` - 主feed页面
- `frontend/src/services/api.ts` - API服务

### 测试
- `tests/e2e/instant-recommendations.spec.ts` - E2E测试


