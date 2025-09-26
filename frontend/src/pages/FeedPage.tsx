import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Search, ExternalLink, Clock, User } from 'lucide-react';
import { feedAPI, sourcesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

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
  justify-content: between;
  align-items: center;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sort: 'recency' as 'recency' | 'trend' | 'personal',
    topic: '',
    source: '',
  });
  const [page, setPage] = useState(1);

  const { data: feedData, isLoading: feedLoading } = useQuery(
    ['feed', filters, page],
    () => feedAPI.getFeed({ ...filters, page, limit: 20 }),
    { keepPreviousData: true }
  );

  const { data: searchData, isLoading: searchLoading } = useQuery(
    ['search', searchQuery, filters],
    () => feedAPI.search(searchQuery, filters),
    { enabled: !!searchQuery }
  );

  const { data: sources } = useQuery('sources', sourcesAPI.getSources);
  const { data: topics } = useQuery('topics', sourcesAPI.getTopics);

  const currentData = searchQuery ? searchData : feedData;
  const isLoading = searchQuery ? searchLoading : feedLoading;

  const handleArticleClick = async (article: any) => {
    // Record click interaction
    await feedAPI.recordInteraction(article.id, 'click');
    // Open article in new tab
    window.open(article.url, '_blank');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically by the query
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
        
        <Filters>
          <FilterSelect
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
          >
            <option value="recency">最新</option>
            <option value="trend">热门</option>
            <option value="personal">个性化</option>
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
        </Filters>
      </Header>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FeedContainer>
          {currentData?.items?.map(article => (
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
              </ArticleMeta>
              
              {article.summary && (
                <ArticleSummary>{article.summary}</ArticleSummary>
              )}
              
              <ArticleFooter>
                <TopicTags>
                  {article.topics?.map(topic => (
                    <TopicTag key={topic}>{topic}</TopicTag>
                  ))}
                </TopicTags>
                
                <ReadButton onClick={(e) => { e.stopPropagation(); handleArticleClick(article); }}>
                  <ExternalLink />
                  阅读
                </ReadButton>
              </ArticleFooter>
            </ArticleCard>
          ))}
          
          {!searchQuery && feedData?.hasNext && (
            <LoadMoreButton onClick={() => setPage(prev => prev + 1)}>
              加载更多
            </LoadMoreButton>
          )}
        </FeedContainer>
      )}
    </Container>
  );
};

export default FeedPage;