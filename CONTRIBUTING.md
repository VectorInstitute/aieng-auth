# Contributing to @vector-institute/aieng-auth

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/VectorInstitute/aieng-auth.git
   cd aieng-auth
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build packages**

   ```bash
   pnpm build
   ```

4. **Run tests**
   ```bash
   pnpm test
   ```

## Project Structure

```
aieng-auth/
├── packages/
│   ├── core/                      # @vector-institute/aieng-auth-core
│   ├── react/                     # @vector-institute/aieng-auth-react
│   └── eslint-config/             # Shared ESLint configuration
├── apps/
│   ├── demo-react/    # React SPA demo
│   └── demo-nextjs/   # Next.js demo
└── .changeset/        # Changeset configuration
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clear, documented code
- Follow the existing code style
- Add tests for new functionality
- Ensure all tests pass: `pnpm test`

### 3. Create a Changeset

Changesets document what changed and determine version bumps. Create one after making your changes:

```bash
pnpm changeset
```

You'll be prompted to:

1. **Select packages** - Choose which packages changed (use spacebar to select):
   - `@vector-institute/aieng-auth-core` - if you modified the core OAuth client
   - `@vector-institute/aieng-auth-react` - if you modified React components/hooks
   - Both - if changes affect both packages

2. **Select bump type**:
   - **patch** (0.0.x) - Bug fixes, documentation updates
   - **minor** (0.x.0) - New features, non-breaking changes
   - **major** (x.0.0) - Breaking changes

3. **Write a summary** - Describe what changed (this appears in the changelog):

   ```
   Added support for custom OAuth scopes

   Users can now pass a `scopes` array to the auth config to request
   additional OAuth scopes beyond the default profile and email.
   ```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add custom OAuth scopes support"
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

- Provide a clear description of your changes
- Reference any related issues
- Ensure CI checks pass

## Changeset Guidelines

### When to Create a Changeset

✅ **Always create a changeset for:**

- New features
- Bug fixes
- Breaking changes
- API changes
- Performance improvements

❌ **Skip changeset for:**

- Documentation-only changes
- Test improvements with no code changes
- Internal refactoring with no user-facing changes
- CI/CD configuration updates

### Changeset Examples

**Bug Fix (patch):**

```markdown
Fixed token refresh failing when offline

The OAuth client now properly handles network errors during token
refresh and retries with exponential backoff.
```

**New Feature (minor):**

```markdown
Added ProtectedRoute component

New ProtectedRoute component redirects unauthenticated users to
login page and supports custom redirect paths.
```

**Breaking Change (major):**

````markdown
BREAKING: Changed AuthProvider config structure

The `config` prop now uses a flat structure instead of nested
objects. Update your code:

Before:

```tsx
<AuthProvider config={{ oauth: { clientId: '...' } }} />
```
````

After:

```tsx
<AuthProvider config={{ clientId: '...' }} />
```

````

## Code Style

- **TypeScript** - All code must be TypeScript with proper types
- **ESLint** - Run `pnpm lint:fix` to auto-fix issues
- **Prettier** - Run `pnpm format` to format code
- **Tests** - Write tests using Jest and React Testing Library

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
````

## Release Process

The release process is automated using GitHub Actions and [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers):

1. **Developer creates changeset** and includes it in their PR
2. **PR is merged to main**
3. **GitHub Action runs** and creates a "Version Packages" PR
4. **Maintainer reviews** the version bumps and changelog
5. **Version PR is merged**
6. **GitHub Action publishes** packages to npm automatically using provenance

**Note**: Trusted Publishers must be configured on npm first (maintainers only). See the README for setup instructions.

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Join our discussions for questions and ideas

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
