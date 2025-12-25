# Development Guidelines

Best practices and coding standards for the Pocket Coach mobile app.

## Purpose

This guide provides comprehensive development standards to ensure code quality, maintainability, and consistency across the codebase. Each guideline is focused on a specific aspect of development.

## Quick Navigation

### 📱 [Responsive Design](./responsive.md)
NativeWind patterns, platform-specific styling, font scaling, and accessibility.

**When to use:** Before implementing any UI component, styling, or layout.

**Key topics:**
- Platform modifiers (`ios:`, `android:`, `web:`)
- When to use Platform.OS vs platform modifiers
- Font scaling and accessibility
- Responsive breakpoints for tablet/web
- Tailwind spacing best practices

---

### 🏗️ [Component Architecture](./architecture.md)
Parent orchestration, custom hooks, and component composition patterns.

**When to use:** Before creating new components or refactoring existing ones.

**Key topics:**
- Parent-child component flow
- When to extract custom hooks
- When to split components
- Prop drilling vs context
- Component size guidelines

---

### 🔌 [API Patterns](./api-patterns.md)
Backend response handling, service layer organization, and token management.

**When to use:** When creating new API integrations or services.

**Key topics:**
- Handling inconsistent backend responses
- Service layer responsibilities
- Error message extraction
- Token management patterns
- API client configuration

---

### ⚠️ [Error Handling](./error-handling.md)
Error utilities, Clerk-specific errors, and toast notifications.

**When to use:** When implementing mutations, API calls, or error scenarios.

**Key topics:**
- Using `formatApiError()` utility
- Clerk error handling patterns
- Mutation error handlers (required)
- Status code handling
- Toast notification standards

---

### 🔄 [React Query](./react-query.md)
Query configuration, mutations, and optimistic updates.

**When to use:** When creating data fetching hooks or mutations.

**Key topics:**
- Query configuration
- Infinite queries for pagination
- Optimistic updates pattern
- Error handling in queries
- Cache invalidation

---

### 📋 [Code Standards](./code-standards.md)
Import order, naming conventions, and TypeScript standards.

**When to use:** Every time you write code (enforce with ESLint).

**Key topics:**
- 7-group import order
- Naming conventions
- TypeScript best practices
- File organization
- ESLint configuration

---

## Related Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Architecture overview and tech stack
- **[feedReel.md](../feedReel.md)** - Feed feature implementation reference

---

## How to Use These Guidelines

1. **Before starting a task:** Review the relevant guideline
2. **During development:** Reference code examples and patterns
3. **During code review:** Ensure compliance with standards
4. **When in doubt:** Check official documentation links provided in each guide

## Contributing

When you identify a new pattern or best practice:
1. Discuss with the team
2. Update the relevant guideline file
3. Keep examples concise and practical
4. Link to official documentation when applicable

---

## Quick Reference

### Common Patterns

**Imports:**
```typescript
// 1. React/RN → 2. External → 3. Types → 4. Business Logic → 5. Constants → 6. Components/Utils → 7. Styles
```

**Platform Styling:**
```typescript
<View className="ios:pt-12 android:pt-8"> // Styling only
if (Platform.OS === 'ios') { } // Behavior/APIs
```

**Error Handling:**
```typescript
import { formatApiError } from '@/libs/utils/errorHandling';
const { title, message } = formatApiError(error);
showToast('error', title, message);
```

**Component Pattern:**
```typescript
// Parent: Data fetching + mutations
// Child: UI + callbacks
```

---

**Last Updated:** 2025-12-26
