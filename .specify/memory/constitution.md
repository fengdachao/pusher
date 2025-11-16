<!--
SYNC IMPACT REPORT
==================
Version Change: [NONE] → 1.0.0 (Initial Constitution)
Date: 2025-11-13

Changes:
- ✅ ADDED: Initial constitution for News Subscription System (新闻订阅系统/Pusher)
- ✅ ADDED: Principle I - Feature Specification First
- ✅ ADDED: Principle II - Full-Stack Type Safety
- ✅ ADDED: Principle III - Quality & Testing
- ✅ ADDED: Principle IV - User Experience Excellence
- ✅ ADDED: Principle V - Maintainability & Simplicity
- ✅ ADDED: Technical Standards section
- ✅ ADDED: Development Workflow section
- ✅ ADDED: Governance rules

Templates Reviewed:
- ✅ .specify/templates/spec-template.md - Aligned (user-focused, testable requirements)
- ✅ .specify/templates/plan-template.md - Aligned (constitution check gate present)
- ✅ .specify/templates/tasks-template.md - Aligned (organized by user story, testable)
- ✅ .specify/templates/commands/*.md - Reviewed for consistency

Follow-up TODOs:
- None - All sections completed

Rationale for Version 1.0.0:
- Initial constitution establishment for the project
- Captures existing practices from README and implementation report
- Formalizes development standards already in use
-->

# News Subscription System Constitution

## Core Principles

### I. Feature Specification First

Every feature MUST begin with proper specification using the `.specify` system before implementation:

- **Specification Required**: All features start with `/speckit.specify` to create spec.md capturing user needs and success criteria
- **Planning Required**: Follow with `/speckit.plan` to generate technical implementation plan with research and design decisions
- **Task Breakdown Required**: Execute `/speckit.tasks` to create actionable, dependency-ordered task breakdown
- **User Story Organization**: Features MUST be broken down by independently testable user stories (P1, P2, P3)
- **No Ad-Hoc Development**: Implementation without specification is prohibited except for critical hotfixes

**Rationale**: Structured feature development ensures all stakeholders understand requirements, technical approaches are researched, and implementations are traceable to user needs. This reduces rework and ensures features deliver actual value.

### II. Full-Stack Type Safety

Type safety MUST be maintained across the entire stack:

- **TypeScript Everywhere**: All backend (NestJS) and frontend (React) code written in TypeScript 5+
- **Strict Mode Required**: TypeScript strict mode enabled, no implicit any, no type assertions without justification
- **API Contracts**: Backend APIs documented with Swagger/OpenAPI 3.0, types generated and shared with frontend
- **Validation at Boundaries**: Use class-validator (backend) and Yup (frontend) for runtime validation at system boundaries
- **Type-Safe State**: React Context and React Query must use explicit TypeScript types

**Rationale**: Type safety catches errors at compile time, improves IDE support, serves as living documentation, and reduces production bugs. The investment in types pays dividends in maintainability.

### III. Quality & Testing

Quality is non-negotiable and verified through automated testing:

- **E2E Tests Required**: All user-facing features MUST have Playwright E2E tests covering critical paths
- **Accessibility Required**: All UI components MUST meet WCAG 2.1 Level AA standards (4.5:1 contrast, keyboard navigation, screen reader support)
- **Performance Budgets**: Page load < 2s on 4G, CLS < 0.1, Lighthouse score ≥ 90
- **Monitoring Required**: All production services monitored via Prometheus + Grafana with health checks
- **No Breaking Changes**: Existing tests must pass before merging, regressions are blocking

**Rationale**: Automated testing catches regressions early, accessibility ensures inclusive design, monitoring enables proactive issue detection, and performance budgets maintain user experience standards.

### IV. User Experience Excellence

User experience drives all design and implementation decisions:

- **Responsive Design Mandatory**: All interfaces MUST work on mobile (< 768px), tablet (768-1024px), and desktop (> 1024px)
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with modern features
- **Loading States**: All async operations show appropriate loading indicators, never leave users uncertain
- **Error Handling**: User-friendly error messages, no technical jargon exposed to end users
- **Performance First**: Optimize bundle size, use code splitting, lazy load non-critical resources

**Rationale**: Users judge quality immediately through interface responsiveness and clarity. Poor UX drives abandonment regardless of feature completeness.

### V. Maintainability & Simplicity

Choose simple, maintainable solutions over complex ones:

- **YAGNI Principle**: Implement only what is specified, no speculative features
- **DRY with Reason**: Abstract when patterns repeat 3+ times, not before
- **Convention Over Configuration**: Follow framework conventions (NestJS modules, React hooks patterns)
- **Documented Decisions**: Complex logic requires inline comments explaining WHY, not WHAT
- **Dependency Discipline**: Evaluate bundle size impact before adding dependencies, prefer standard library

**Rationale**: Complexity is a liability that increases cognitive load, introduces bugs, and slows future development. Simple solutions are easier to understand, test, and modify.

## Technical Standards

### Architecture

- **Backend**: NestJS 10+ with modular architecture, dependency injection, and middleware pattern
- **Frontend**: React 18+ with functional components, hooks, and styled-components for styling
- **Database**: PostgreSQL 15+ with TypeORM for migrations and queries
- **Caching**: Redis 7+ for session management and hot data caching
- **Search**: OpenSearch 2.9+ for full-text search and aggregations

### Code Quality

- **Linting**: ESLint with project-specific rules, Prettier for formatting
- **Git Workflow**: Feature branches from main, squash merge after review
- **Commit Messages**: Conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Code Review**: All changes require review, automated checks must pass
- **Documentation**: README for setup, inline comments for complex logic, API docs via Swagger

### Security

- **Authentication**: JWT tokens with secure storage, bcrypt for password hashing
- **Authorization**: Role-based access control enforced at API layer
- **Input Validation**: Validate and sanitize all user inputs at boundaries
- **SQL Injection Protection**: Use TypeORM parameterized queries, never string concatenation
- **XSS Protection**: React's built-in escaping, Content Security Policy headers

### Performance

- **Database Indexing**: Index all foreign keys and frequently queried columns
- **Query Optimization**: Use query analysis to prevent N+1 queries, implement pagination
- **Caching Strategy**: Cache hot data in Redis with appropriate TTL
- **Asset Optimization**: Compress images (WebP), minify CSS/JS, use CDN for static assets
- **Monitoring**: Track response times, error rates, and resource usage via Prometheus

## Development Workflow

### Feature Development Lifecycle

1. **Specification Phase**: Create spec.md via `/speckit.specify` with user stories and acceptance criteria
2. **Planning Phase**: Generate plan.md via `/speckit.plan` with technical approach and research
3. **Task Breakdown**: Generate tasks.md via `/speckit.tasks` organized by user story
4. **Implementation**: Execute tasks in priority order (P1 → P2 → P3), commit frequently
5. **Testing**: Write/run E2E tests, verify accessibility, check performance budgets
6. **Review**: Submit PR with reference to spec, respond to review feedback
7. **Deployment**: Merge to main triggers CI/CD, monitor metrics post-deployment

### Quality Gates

Features cannot merge unless:
- ✅ All E2E tests pass (existing + new)
- ✅ Accessibility audit shows no WCAG AA violations
- ✅ Performance budgets met (load time, CLS, Lighthouse score)
- ✅ TypeScript compiles with no errors in strict mode
- ✅ Code review approved by at least one maintainer
- ✅ API documentation updated if endpoints added/changed

### Branch Strategy

- **main**: Production-ready code, protected branch
- **feature/###-short-name**: Feature branches created via `/speckit.specify`
- **hotfix/description**: Emergency fixes, fast-tracked review
- **docs/description**: Documentation-only changes

### Versioning

- **Semantic Versioning**: MAJOR.MINOR.PATCH format
- **Constitution Versioning**: Follows same semantic versioning rules
- **API Versioning**: Breaking API changes require new version endpoint (/api/v2/)
- **Database Migrations**: Sequential, never modify existing migrations, always reversible

## Governance

### Amendment Procedure

1. **Proposal**: Submit proposed amendment with rationale as GitHub issue
2. **Discussion**: Minimum 7-day discussion period for community input
3. **Approval**: Requires majority approval from core maintainers
4. **Documentation**: Update constitution with version bump and sync impact report
5. **Propagation**: Update all dependent templates and documentation for consistency

### Constitution Authority

- This constitution supersedes informal practices and ad-hoc decisions
- When practices conflict with constitution, constitution takes precedence
- Violations should be identified during code review and corrected before merge
- Systematic violations indicate need for constitution amendment, not exception

### Compliance

- **Code Review**: Reviewers MUST verify compliance with constitutional principles
- **CI/CD Checks**: Automated checks enforce testability, type safety, and performance budgets
- **Retrospectives**: Monthly review of adherence and identification of improvement areas
- **Education**: New contributors onboarded with constitution review and examples

### Exception Process

Exceptions to constitutional principles require:
1. **Justification**: Clear documentation of why principle cannot be followed
2. **Mitigation**: Plan for minimizing impact and eventual compliance
3. **Approval**: Explicit approval from project lead
4. **Tracking**: Exception logged in decision log with review timeline

**Version**: 1.0.0 | **Ratified**: 2025-11-13 | **Last Amended**: 2025-11-13
