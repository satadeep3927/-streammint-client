# StreamMint Client - NPM Publishing Guide

## Setup for Publishing

### 1. Prerequisites

Make sure you have:
- An npm account (sign up at https://www.npmjs.com/)
- npm CLI installed and logged in: `npm login`
- All tests passing (except known flaky ones)
- Build artifacts generated

### 2. Publishing Commands

```bash
# Build the package
npm run build

# Run dry-run to test (without actually publishing)
npm run publish:dry

# Publish beta version for testing
npm run publish:beta

# Publish to latest (production)
npm run publish:latest

# Or simply
npm publish
```

### 3. Version Management

```bash
# Bump patch version (1.0.0 -> 1.0.1)
npm version patch

# Bump minor version (1.0.0 -> 1.1.0)
npm version minor

# Bump major version (1.0.0 -> 2.0.0)
npm version major

# Custom version
npm version 1.2.3
```

### 4. Publishing Workflow

1. **Development:**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: add new feature"
   
   # Run tests
   npm test
   
   # Build
   npm run build
   ```

2. **Pre-publish Testing:**
   ```bash
   # Test the package locally
   npm run publish:dry
   
   # Test in another project
   npm pack
   # This creates streammint-client-1.0.0.tgz
   # Install in test project: npm install /path/to/streammint-client-1.0.0.tgz
   ```

3. **Version and Publish:**
   ```bash
   # Bump version
   npm version patch
   
   # Push version commit and tag
   git push origin main --follow-tags
   
   # Publish to npm
   npm publish
   ```

### 5. Beta/RC Publishing

```bash
# Publish beta version
npm version prerelease --preid=beta
npm publish --tag beta

# Publish release candidate
npm version prerelease --preid=rc
npm publish --tag rc

# Install beta in projects
npm install @streammint/client@beta
```

### 6. Package Information

- **Name:** `@streammint/client`
- **Registry:** https://registry.npmjs.org/
- **Repository:** https://github.com/satadeep3927/-streammint-client
- **License:** MIT

### 7. Automated Publishing (GitHub Actions)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Run tests (excluding flaky ones)
        run: npm run test:ci
        
      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 8. First Time Setup

```bash
# 1. Login to npm
npm login

# 2. Verify login
npm whoami

# 3. Check package name availability
npm view @streammint/client

# 4. Publish
npm publish
```

### 9. Post-Publish Verification

```bash
# Check published package
npm view @streammint/client

# Test installation
npm install @streammint/client

# Verify exports
node -e "console.log(require('@streammint/client'))"
```

### 10. Troubleshooting

**Common Issues:**

1. **Name already taken:**
   - Change package name in package.json
   - Use scoped package: `@your-org/package-name`

2. **Permission denied:**
   - Run `npm login` again
   - Check if you're member of the organization (for scoped packages)

3. **Version already exists:**
   - Bump version: `npm version patch`
   - Or publish with different tag: `npm publish --tag beta`

4. **Tests failing:**
   - Fix tests or use `npm run test:ci` for CI-safe tests
   - Update prepublishOnly script if needed

### 11. Package Stats

After publishing, monitor at:
- https://www.npmjs.com/package/@streammint/client
- https://npm-stat.com/charts.html?package=@streammint/client

---

## Quick Publish Checklist

- [ ] All changes committed and pushed
- [ ] Tests passing (npm test or npm run test:ci)
- [ ] Build successful (npm run build)
- [ ] Version bumped (npm version patch/minor/major)
- [ ] Dry-run successful (npm run publish:dry)
- [ ] Ready to publish (npm publish)
