# Naming Conventions

## General

- Use English for code identifiers.
- Use Chinese for user-facing product copy when the existing UI already uses Chinese.
- Keep names explicit and domain-driven.
- Avoid unclear abbreviations unless they are standard in the stack.

## Files

- Vue components: `PascalCase.vue`
- TypeScript utilities and modules: `camelCase.ts`
- Backend controllers: `<domain>Controller.js`
- Backend routes: `<domain>.js`
- Middleware: concise behavior-based names such as `auth.js`
- Test files: `<target>.test.js` or `<target>.test.ts`
- Requirement docs: `docs/requirements/<yyyy-mm-dd>-<feature-name>.md`
- Plan docs: `docs/plans/<yyyy-mm-dd>-<feature-name>.md`

## Variables

- Regular variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Boolean values: prefix with `is`, `has`, `can`, or `should`
- Collections: plural nouns

## Functions

- Actions should use verbs: `getResumeById`, `updateResume`, `verifyToken`
- Validators should start with `validate`
- Transformers should start with `format`, `map`, `parse`, or `build`
- Event handlers in Vue should start with `handle`

## Components

- Form components should end with `Form`
- Template components should end with `Template`
- Modal or dialog wrappers should end with `Dialog` if introduced later
- View-level pages should live in `src/views/` and keep route-aligned names

## API Names

- Use plural resources for route groups when representing collections
- Use kebab-case for multi-word endpoint segments
- Keep endpoint semantics resource-oriented

## Database Names

- Table names: `snake_case`
- Columns: `snake_case`
- Foreign key references should end with `_id`

## Environment Variables

- Server variables: `UPPER_SNAKE_CASE`
- Vite client variables must start with `VITE_`

## Anti-Patterns

- Do not use mixed Chinese-English identifier names.
- Do not introduce single-letter variable names outside tiny local scopes.
- Do not create duplicate utility names for slightly different wrappers.
