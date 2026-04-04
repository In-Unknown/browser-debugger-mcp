# Contributing to Browser Debugger MCP

Thank you for your interest in contributing to Browser Debugger MCP! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Fork the Repository

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/your-username/browser-debugger.git
cd browser-debugger
```

3. Add the original repository as upstream:
```bash
git remote add upstream https://github.com/original-username/browser-debugger.git
```

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run in development mode:
```bash
npm run dev
```

## Making Changes

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

Examples:
- `feature/add-firefox-support`
- `fix/page-memory-leak`
- `docs/update-api-reference`

### Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Examples:
- `feat(page): add screenshot support to open_page tool`
- `fix(console): resolve memory leak in console environment`
- `docs(readme): update installation instructions`

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

### Error Handling

- Always handle errors appropriately
- Provide clear error messages
- Use try-catch blocks for async operations
- Log errors for debugging purposes

### Code Organization

- Keep functions focused and single-purpose
- Avoid code duplication
- Use appropriate design patterns
- Maintain separation of concerns

## Testing

### Test Coverage

- Write tests for new features
- Ensure all existing tests pass
- Add test cases for bug fixes

### Running Tests

```bash
npm test
```

### Test Plan

Refer to `TESTING_PLAN.md` for comprehensive testing guidelines. Tests should be executed through MCP client calls.

## Pull Request Process

### Before Submitting

1. Update documentation if needed
2. Add or update tests
3. Ensure code passes linting
4. Rebase on the latest main branch

### PR Description

Include:
- Clear description of changes
- Motivation for the change
- Related issue numbers
- Screenshots for UI changes
- Testing instructions

### Review Process

1. Automated checks must pass
2. At least one maintainer approval
3. Address all review comments
4. Update based on feedback

## Documentation

### Code Documentation

- Document complex logic
- Explain non-obvious implementations
- Add examples for API usage

### User Documentation

- Update README for user-facing changes
- Add inline comments for configuration
- Create or update guides for new features

## Reporting Issues

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, browser version)
- Relevant logs or error messages

### Feature Requests

Include:
- Clear description of the feature
- Use case or motivation
- Potential implementation approach
- Examples or mockups if applicable

## Release Process

### Versioning

Follow Semantic Versioning:
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes (backwards compatible)

### Release Checklist

- Update version in package.json
- Update CHANGELOG.md
- Tag the release
- Create GitHub release
- Update documentation

## Community

### Communication

- Use GitHub Issues for bug reports and feature requests
- Use GitHub Discussions for general questions
- Respect other contributors' time and expertise

### Support

- Help answer questions in issues and discussions
- Review pull requests when able
- Share knowledge and best practices

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or discussion if you have questions about contributing to this project.
