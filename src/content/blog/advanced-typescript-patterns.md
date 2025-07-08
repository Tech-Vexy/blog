---
title: 'Mastering TypeScript: Advanced Patterns for Modern Development'
cover: '../../assets/blog-placeholder-5.jpg'
coverAlt: 'TypeScript code patterns and advanced development techniques'
description: 'Explore advanced TypeScript patterns and techniques to write more maintainable and type-safe code'
pubDate: 2024-12-20
heroImage: '../../assets/blog-placeholder-5.jpg'
---

TypeScript has become the de facto standard for building large-scale JavaScript applications. While many developers are comfortable with basic TypeScript, mastering advanced patterns can significantly improve code quality, maintainability, and developer experience. Let's explore some powerful TypeScript patterns that will elevate your development skills.

## Advanced Type Patterns

### 1. Conditional Types

Conditional types allow you to create types that depend on a condition, enabling more flexible and reusable type definitions.

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;  // true
type Test2 = IsString<number>;  // false

// Practical example: Extract return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
    return { id: 1, name: 'John', email: 'john@example.com' };
}

type UserType = ReturnType<typeof getUser>;
// { id: number; name: string; email: string; }
```

### 2. Mapped Types

Mapped types allow you to create new types by transforming properties of existing types.

```typescript
// Make all properties optional
type Partial<T> = {
    [P in keyof T]?: T[P];
};

// Make all properties readonly
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// Advanced example: Deep partial
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface User {
    id: number;
    profile: {
        name: string;
        settings: {
            theme: string;
            notifications: boolean;
        };
    };
}

type PartialUser = DeepPartial<User>;
// All properties including nested ones are optional
```

### 3. Template Literal Types

Template literal types enable string manipulation at the type level.

```typescript
// API endpoint generation
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/${string}`;
type ApiRoute<M extends HttpMethod, E extends ApiEndpoint> = `${M} ${E}`;

type UserRoutes = 
    | ApiRoute<'GET', '/users'>
    | ApiRoute<'POST', '/users'>
    | ApiRoute<'PUT', '/users/:id'>
    | ApiRoute<'DELETE', '/users/:id'>;

// Event naming convention
type EventName<T extends string> = `on${Capitalize<T>}`;
type ButtonEvents = EventName<'click' | 'hover' | 'focus'>;
// 'onClick' | 'onHover' | 'onFocus'
```

## Utility Types and Patterns

### 1. Discriminated Unions

Create type-safe unions with discriminator properties.

```typescript
// API response handling
interface LoadingState {
    status: 'loading';
}

interface SuccessState {
    status: 'success';
    data: any;
}

interface ErrorState {
    status: 'error';
    error: string;
}

type ApiState = LoadingState | SuccessState | ErrorState;

function handleApiResponse(state: ApiState) {
    switch (state.status) {
        case 'loading':
            return 'Loading...';
        case 'success':
            return state.data; // TypeScript knows data exists
        case 'error':
            return state.error; // TypeScript knows error exists
    }
}
```

### 2. Branded Types

Create nominal types to prevent mixing similar primitive types.

```typescript
// Branded types for IDs
type UserId = string & { __brand: 'UserId' };
type ProductId = string & { __brand: 'ProductId' };

function createUserId(id: string): UserId {
    return id as UserId;
}

function createProductId(id: string): ProductId {
    return id as ProductId;
}

function getUser(userId: UserId) {
    // Implementation
}

function getProduct(productId: ProductId) {
    // Implementation
}

const userId = createUserId('user-123');
const productId = createProductId('product-456');

getUser(userId);     // ✅ Correct
getUser(productId);  // ❌ Type error
```

### 3. Builder Pattern with TypeScript

Create fluent APIs with compile-time validation.

```typescript
// Query builder with type safety
interface QueryBuilder<T extends Record<string, any>> {
    select<K extends keyof T>(fields: K[]): QueryBuilder<Pick<T, K>>;
    where<K extends keyof T>(field: K, value: T[K]): QueryBuilder<T>;
    limit(count: number): QueryBuilder<T>;
    execute(): Promise<T[]>;
}

class SqlQueryBuilder<T extends Record<string, any>> implements QueryBuilder<T> {
    private query: string[] = [];
    
    select<K extends keyof T>(fields: K[]): QueryBuilder<Pick<T, K>> {
        this.query.push(`SELECT ${fields.join(', ')}`);
        return this as any;
    }
    
    where<K extends keyof T>(field: K, value: T[K]): QueryBuilder<T> {
        this.query.push(`WHERE ${String(field)} = ${value}`);
        return this;
    }
    
    limit(count: number): QueryBuilder<T> {
        this.query.push(`LIMIT ${count}`);
        return this;
    }
    
    async execute(): Promise<T[]> {
        // Execute query
        return [];
    }
}

// Usage
interface User {
    id: number;
    name: string;
    email: string;
}

const users = await new SqlQueryBuilder<User>()
    .select(['id', 'name'])  // Result type: Pick<User, 'id' | 'name'>
    .where('id', 123)        // Type-safe field and value
    .limit(10)
    .execute();
```

## Advanced Patterns for React

### 1. Component Props with Discriminated Unions

Create flexible component APIs with type safety.

```typescript
// Button component with variant-specific props
interface BaseButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
}

interface PrimaryButtonProps extends BaseButtonProps {
    variant: 'primary';
    size: 'small' | 'medium' | 'large';
}

interface LinkButtonProps extends BaseButtonProps {
    variant: 'link';
    href: string;
    external?: boolean;
}

interface IconButtonProps extends BaseButtonProps {
    variant: 'icon';
    icon: React.ReactNode;
    'aria-label': string;
}

type ButtonProps = PrimaryButtonProps | LinkButtonProps | IconButtonProps;

function Button(props: ButtonProps) {
    switch (props.variant) {
        case 'primary':
            return <button className={`btn-${props.size}`}>{props.children}</button>;
        case 'link':
            return (
                <a href={props.href} target={props.external ? '_blank' : undefined}>
                    {props.children}
                </a>
            );
        case 'icon':
            return (
                <button aria-label={props['aria-label']}>
                    {props.icon}
                </button>
            );
    }
}
```

### 2. Higher-Order Components with Generic Constraints

Create reusable HOCs with proper type inference.

```typescript
// withLoading HOC
interface WithLoadingProps {
    loading: boolean;
}

function withLoading<P extends object>(
    Component: React.ComponentType<P>
): React.ComponentType<P & WithLoadingProps> {
    return ({ loading, ...props }: P & WithLoadingProps) => {
        if (loading) {
            return <div>Loading...</div>;
        }
        return <Component {...(props as P)} />;
    };
}

// Usage
interface UserListProps {
    users: User[];
    onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onUserClick }) => {
    return (
        <div>
            {users.map(user => (
                <div key={user.id} onClick={() => onUserClick(user)}>
                    {user.name}
                </div>
            ))}
        </div>
    );
};

const UserListWithLoading = withLoading(UserList);
// Props: UserListProps & WithLoadingProps
```

## API Design Patterns

### 1. Fluent Configuration API

Create chainable configuration objects.

```typescript
// HTTP client configuration
class HttpClient {
    private config: {
        baseUrl?: string;
        timeout?: number;
        headers?: Record<string, string>;
        interceptors?: {
            request?: (config: any) => any;
            response?: (response: any) => any;
        };
    } = {};
    
    baseUrl(url: string): this {
        this.config.baseUrl = url;
        return this;
    }
    
    timeout(ms: number): this {
        this.config.timeout = ms;
        return this;
    }
    
    header(key: string, value: string): this {
        this.config.headers = { ...this.config.headers, [key]: value };
        return this;
    }
    
    interceptRequest(handler: (config: any) => any): this {
        this.config.interceptors = {
            ...this.config.interceptors,
            request: handler
        };
        return this;
    }
    
    build(): ConfiguredHttpClient {
        return new ConfiguredHttpClient(this.config);
    }
}

// Usage
const client = new HttpClient()
    .baseUrl('https://api.example.com')
    .timeout(5000)
    .header('Authorization', 'Bearer token')
    .interceptRequest(config => {
        console.log('Request:', config);
        return config;
    })
    .build();
```

### 2. Type-Safe Event Emitter

Create event systems with compile-time event validation.

```typescript
// Event emitter with typed events
type EventMap = {
    user:created: User;
    user:updated: { id: number; changes: Partial<User> };
    user:deleted: { id: number };
    system:error: Error;
};

class TypedEventEmitter<T extends Record<string, any>> {
    private listeners: {
        [K in keyof T]?: Array<(data: T[K]) => void>;
    } = {};
    
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }
    
    emit<K extends keyof T>(event: K, data: T[K]): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            eventListeners.forEach(listener => listener(data));
        }
    }
    
    off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }
}

// Usage
const emitter = new TypedEventEmitter<EventMap>();

emitter.on('user:created', (user) => {
    // user is typed as User
    console.log('User created:', user.name);
});

emitter.emit('user:created', { id: 1, name: 'John', email: 'john@example.com' });
```

## Testing with TypeScript

### 1. Type-Safe Mock Creation

Create mocks that maintain type safety.

```typescript
// Mock utility
type MockedFunction<T extends (...args: any[]) => any> = {
    (...args: Parameters<T>): ReturnType<T>;
    mockReturnValue: (value: ReturnType<T>) => void;
    mockResolvedValue: (value: Awaited<ReturnType<T>>) => void;
    mockRejectedValue: (error: any) => void;
};

type MockedObject<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
        ? MockedFunction<T[K]>
        : T[K];
};

function createMock<T>(): MockedObject<T> {
    return new Proxy({} as MockedObject<T>, {
        get: (target, prop) => {
            if (!(prop in target)) {
                const mockFn = jest.fn();
                mockFn.mockReturnValue = (value: any) => mockFn.mockReturnValue(value);
                mockFn.mockResolvedValue = (value: any) => mockFn.mockResolvedValue(value);
                mockFn.mockRejectedValue = (error: any) => mockFn.mockRejectedValue(error);
                target[prop as keyof T] = mockFn;
            }
            return target[prop as keyof T];
        }
    });
}

// Usage
interface UserService {
    getUser(id: number): Promise<User>;
    updateUser(id: number, updates: Partial<User>): Promise<User>;
}

const mockUserService = createMock<UserService>();
mockUserService.getUser.mockResolvedValue({
    id: 1,
    name: 'John',
    email: 'john@example.com'
});
```

### 2. Test Type Assertions

Create compile-time type tests.

```typescript
// Type assertion utilities
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

// Test types
type TestCases = [
    Expect<Equal<ReturnType<typeof getUser>, User>>,
    Expect<Equal<Parameters<typeof updateUser>, [number, Partial<User>]>>,
    Expect<Equal<DeepPartial<User>, {
        id?: number;
        profile?: {
            name?: string;
            settings?: {
                theme?: string;
                notifications?: boolean;
            };
        };
    }>>,
];
```

## Performance Optimization

### 1. Lazy Type Evaluation

Use conditional types to defer expensive type computations.

```typescript
// Lazy evaluation for complex types
type LazyDeepReadonly<T> = T extends any ? DeepReadonly<T> : never;

type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object
        ? LazyDeepReadonly<T[P]>
        : T[P];
};
```

### 2. Type Caching

Cache expensive type computations using type aliases.

```typescript
// Cache complex union types
type AllowedMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ApiEndpoints = '/users' | '/products' | '/orders' | '/settings';

// Instead of recomputing every time
type CachedApiRoutes = {
    [M in AllowedMethods]: {
        [E in ApiEndpoints]: `${M} ${E}`;
    };
}[AllowedMethods][ApiEndpoints];
```

## Conclusion

Mastering these advanced TypeScript patterns will significantly improve your development experience and code quality. These techniques provide:

- **Better type safety** with compile-time guarantees
- **Improved developer experience** with better IntelliSense and error messages
- **More maintainable code** with self-documenting types
- **Reduced runtime errors** through static analysis

As TypeScript continues to evolve, staying current with these advanced patterns will help you build more robust and maintainable applications. Remember to balance type complexity with readability—the goal is to make your code more maintainable, not more complicated.

The key to mastering TypeScript is practice and gradual adoption of these patterns. Start with the basics and gradually incorporate more advanced techniques as you become comfortable with the concepts.
