import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { 
  Search, 
  ExternalLink, 
  Clock, 
  User, 
  Bookmark, 
  ThumbsUp,
  ThumbsDown,
  Filter,
  TrendingUp,
  Eye,
  Share2
} from 'lucide-react';
import { feedAPI, sourcesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 500px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  width: 20px;
  height: 20px;
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FeedContainer = styled.div`
  display: grid;
  gap: 20px;
`;

const ArticleCard = styled.article`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ArticleHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ArticleTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ArticleSummary = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const ArticleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ArticleActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
  
  &.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }
  
  &.liked {
    color: #28a745;
    border-color: #28a745;
  }
  
  &.disliked {
    color: #dc3545;
    border-color: #dc3545;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AdvancedFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  h3 {
    margin-bottom: 8px;
    color: #333;
  }
  
  p {
    margin-bottom: 16px;
  }
`;

const SuggestionButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #0056b3;
  }
`;

const TopicTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TopicTag = styled.span`
  background: #f8f9ff;
  color: #007bff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ReadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
`;

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'personal' as 'recency' | 'trend' | 'personal',
    topic: '',
    source: '',
    lang: '',
    dateFrom: '',
    dateTo: '',
    diversity: true,
  });
  const [page, setPage] = useState(1);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [dislikedArticles, setDislikedArticles] = useState<Set<string>>(new Set());

  const { data: feedData, isLoading: feedLoading, error: feedError } = useQuery(
    ['feed', filters, page],
    () => feedAPI.getFeed({ 
      ...filters, 
      page, 
      limit: 20,
      userId: user?.id 
    }),
    { 
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery(
    ['search', searchQuery, filters],
    () => {
      const sort = searchQuery ? 'relevance' : (filters.sort === 'trend' ? 'popularity' : (filters.sort === 'personal' ? 'recency' : filters.sort));
      return feedAPI.search(searchQuery, {
        ...filters,
        sort: sort as 'relevance' | 'recency' | 'popularity' | undefined,
      });
    },
    { 
      enabled: !!searchQuery.trim(),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const { data: sources } = useQuery('sources', sourcesAPI.getSources);
  const { data: topics } = useQuery('topics', sourcesAPI.getTopics);

  const currentData = searchQuery.trim() ? searchData : feedData;
  const isLoading = searchQuery.trim() ? searchLoading : feedLoading;
  const error = searchQuery.trim() ? searchError : feedError;

  // Mutations for interactions
  const interactionMutation = useMutation(
    ({ articleId, type, metadata }: { articleId: string, type: string, metadata?: any }) =>
      feedAPI.recordInteraction(articleId, type, metadata),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['feed']);
      }
    }
  );

  const bookmarkMutation = useMutation(
    ({ articleId, isBookmarked }: { articleId: string, isBookmarked: boolean }) =>
      isBookmarked ? feedAPI.removeBookmark(articleId) : feedAPI.addBookmark(articleId),
    {
      onSuccess: (_, variables) => {
        const newBookmarked = new Set(bookmarkedArticles);
        if (variables.isBookmarked) {
          newBookmarked.delete(variables.articleId);
        } else {
          newBookmarked.add(variables.articleId);
        }
        setBookmarkedArticles(newBookmarked);
      }
    }
  );

  // Load user bookmarks on mount
  useEffect(() => {
    if (user) {
      feedAPI.getBookmarks().then(bookmarks => {
        setBookmarkedArticles(new Set(bookmarks.items.map(b => b.articleId)));
      }).catch(err => {
        // Bookmarks feature not implemented yet, silently ignore
        if (err?.response?.status !== 404) {
          console.error('Failed to load bookmarks:', err);
        }
      });
    }
  }, [user]);

  const handleArticleClick = async (article: any) => {
    // Record click interaction
    interactionMutation.mutate({ 
      articleId: article.id, 
      type: 'click',
      metadata: { channel: 'web' }
    });
    
    // Open article in new tab
    window.open(article.url, '_blank');
  };

  const handleBookmark = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedArticles.has(articleId);
    bookmarkMutation.mutate({ articleId, isBookmarked });
  };

  const handleLike = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedArticles.has(articleId);
    const isDisliked = dislikedArticles.has(articleId);
    
    if (isLiked) {
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    } else {
      setLikedArticles(prev => new Set(prev).add(articleId));
      if (isDisliked) {
        setDislikedArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
      }
    }
    
    interactionMutation.mutate({ 
      articleId, 
      type: isLiked ? 'unlike' : 'like' 
    });
  };

  const handleDislike = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDisliked = dislikedArticles.has(articleId);
    const isLiked = likedArticles.has(articleId);
    
    if (isDisliked) {
      setDislikedArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    } else {
      setDislikedArticles(prev => new Set(prev).add(articleId));
      if (isLiked) {
        setLikedArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
      }
    }
    
    interactionMutation.mutate({ 
      articleId, 
      type: isDisliked ? 'undislike' : 'dislike' 
    });
  };

  const handleShare = async (article: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url,
        });
        
        interactionMutation.mutate({ 
          articleId: article.id, 
          type: 'share',
          metadata: { method: 'native' }
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(article.url);
        alert('链接已复制到剪贴板');
        
        interactionMutation.mutate({ 
          articleId: article.id, 
          type: 'share',
          metadata: { method: 'clipboard' }
        });
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      sort: 'personal',
      topic: '',
      source: '',
      lang: '',
      dateFrom: '',
      dateTo: '',
      diversity: true,
    });
    setSearchQuery('');
    setPage(1);
  };

  return (
    <Container>
      <Header>
        <Title>新闻订阅</Title>
        
        <form onSubmit={handleSearch}>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="搜索新闻..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon />
          </SearchContainer>
        </form>
        
        <FiltersContainer>
          <FilterSelect
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
          >
            <option value="personal">🎯 个性化</option>
            <option value="recency">🕒 最新</option>
            <option value="trend">🔥 热门</option>
          </FilterSelect>
          
          <FilterSelect
            value={filters.topic}
            onChange={(e) => setFilters(prev => ({ ...prev, topic: e.target.value }))}
          >
            <option value="">所有主题</option>
            {topics?.map(topic => (
              <option key={topic.code} value={topic.code}>{topic.name}</option>
            ))}
          </FilterSelect>
          
          <FilterSelect
            value={filters.source}
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
          >
            <option value="">所有来源</option>
            {sources?.map(source => (
              <option key={source.code} value={source.code}>{source.name}</option>
            ))}
          </FilterSelect>

          <FilterToggle 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter />
            高级筛选
          </FilterToggle>

          {(filters.topic || filters.source || filters.dateFrom || filters.dateTo) && (
            <ActionButton onClick={clearFilters}>
              清除筛选
            </ActionButton>
          )}
        </FiltersContainer>

        {showAdvancedFilters && (
          <AdvancedFilters>
            <FilterGroup>
              <FilterLabel>语言</FilterLabel>
              <FilterSelect
                value={filters.lang}
                onChange={(e) => setFilters(prev => ({ ...prev, lang: e.target.value }))}
              >
                <option value="">所有语言</option>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>开始日期</FilterLabel>
              <DateInput
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>结束日期</FilterLabel>
              <DateInput
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <input
                  type="checkbox"
                  checked={filters.diversity}
                  onChange={(e) => setFilters(prev => ({ ...prev, diversity: e.target.checked }))}
                  style={{ marginRight: '8px' }}
                />
                多样性推荐
              </FilterLabel>
            </FilterGroup>
          </AdvancedFilters>
        )}

        {currentData && (
          <ResultsInfo>
            <span>
              {searchQuery.trim() ? (
                <>找到 {(currentData as any).totalHits || currentData.total} 条相关结果</>
              ) : (
                <>共 {currentData.total} 条资讯</>
              )}
              {(currentData as any).tookMs && <> · 耗时 {(currentData as any).tookMs}ms</>}
            </span>
            {currentData.items?.length > 0 && (
              <span>第 {page} 页</span>
            )}
          </ResultsInfo>
        )}
      </Header>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <NoResults>
          <h3>加载失败</h3>
          <p>请检查网络连接或稍后重试</p>
          <SuggestionButton onClick={() => window.location.reload()}>
            重新加载
          </SuggestionButton>
        </NoResults>
      ) : !currentData?.items?.length ? (
        <NoResults>
          <h3>没有找到相关内容</h3>
          {searchQuery.trim() ? (
            <>
              <p>尝试使用不同的关键词或调整筛选条件</p>
              <SuggestionButton onClick={clearFilters}>
                清除筛选条件
              </SuggestionButton>
            </>
          ) : (
            <p>暂时没有新的资讯内容</p>
          )}
        </NoResults>
      ) : (
        <FeedContainer>
          {currentData.items.map(article => (
            <ArticleCard key={article.id} onClick={() => handleArticleClick(article)}>
              <ArticleTitle>{article.title}</ArticleTitle>
              
              <ArticleMeta>
                <MetaItem>
                  <User />
                  {article.sourceName}
                </MetaItem>
                <MetaItem>
                  <Clock />
                  {format(new Date(article.publishedAt), 'MM-dd HH:mm')}
                </MetaItem>
                {article.popularity && (
                  <MetaItem>
                    <TrendingUp />
                    热度 {Math.round(article.popularity * 100)}
                  </MetaItem>
                )}
              </ArticleMeta>
              
              {article.summary && (
                <ArticleSummary>{article.summary}</ArticleSummary>
              )}
              
              <ArticleFooter>
                <TopicTags>
                  {article.topics?.map(topic => (
                    <TopicTag 
                      key={topic}
                    >
                      {topic}
                    </TopicTag>
                  ))}
                </TopicTags>
                
                <ArticleActions>
                  <ActionButton
                    className={likedArticles.has(article.id) ? 'liked' : ''}
                    onClick={(e) => handleLike(article.id, e)}
                    title="点赞"
                  >
                    <ThumbsUp />
                  </ActionButton>
                  
                  <ActionButton
                    className={dislikedArticles.has(article.id) ? 'disliked' : ''}
                    onClick={(e) => handleDislike(article.id, e)}
                    title="不喜欢"
                  >
                    <ThumbsDown />
                  </ActionButton>
                  
                  <ActionButton
                    className={bookmarkedArticles.has(article.id) ? 'active' : ''}
                    onClick={(e) => handleBookmark(article.id, e)}
                    title="收藏"
                  >
                    {bookmarkedArticles.has(article.id) ? <Bookmark /> : <Bookmark />}
                  </ActionButton>
                  
                  <ActionButton
                    onClick={(e) => handleShare(article, e)}
                    title="分享"
                  >
                    <Share2 />
                  </ActionButton>
                  
                  <ReadButton onClick={(e) => { e.stopPropagation(); handleArticleClick(article); }}>
                    <ExternalLink />
                    阅读
                  </ReadButton>
                </ArticleActions>
              </ArticleFooter>
            </ArticleCard>
          ))}
          
          {!searchQuery.trim() && feedData?.hasNext && (
            <LoadMoreButton 
              onClick={() => setPage(prev => prev + 1)}
              disabled={feedLoading}
            >
              {feedLoading ? '加载中...' : '加载更多'}
            </LoadMoreButton>
          )}
        </FeedContainer>
      )}
    </Container>
  );
};

export default FeedPage;