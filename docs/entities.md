# entities.md — Entities Structure

Each domain lives under `entities/{domain}/`. The shape varies by entity — only `infrastructure/`, `types/`, and `index.ts` are universal. A fuller entity (e.g. `member`) looks like:

```
entities/{domain}/
  schema.ts                       — base zod schema(s) shared across layers (optional)
  core/
    {domain}.domain.schema.ts     — pure domain schema (transformation target)
    {domain}.factory.ts           — builds/parses domain objects from DTO input
  infrastructure/
    {domain}.dto.schema.ts        — raw API response zod schemas (DTO)
    {domain}.adapters.ts          — API-envelope/DTO → domain adapters
    {domain}.repository.ts        — API calls (also seen as {domain}.api.repository.ts)
    {domain}.keys.ts              — TanStack Query keys
  mapper/                         — pure display/util mappers (optional, e.g. member, profile)
  policy/                         — authorization/ability rules (optional, e.g. member)
  hooks/                          — entity-level query hooks (optional, e.g. member)
  types/
    index.ts                      — final UI-ready types exported to consumers
```

Not every entity has every folder. Simpler entities (e.g. `study-room`) omit `mapper/`, `policy/`, `hooks/`. Older entities (e.g. `notification`) still use the flatter naming `{domain}.dto.ts` / `core/{domain}.domain.ts` without separate `adapters`/`factory` files. Follow the conventions of the entity you are editing.

---

## Entity File Comments

New or newly organized entity files should use section comments like `src/entities/column` so DTOs, repositories, keys, domain schemas, and exported types are easy to scan.

Use this format:

```ts
/* ─────────────────────────────────────────────────────
 * [READ] 칼럼 목록 조회 (공개, APPROVED만)
 * ────────────────────────────────────────────────────*/
```

Guidelines:

- In `*.dto.ts`, group schemas by API purpose: list/detail, my page, admin, payload, export.
- In `*.repository.ts`, add a comment above each repository function with the HTTP action tag (`[READ]`, `[CREATE]`, `[UPDATE]`, `[PATCH]`, `[DELETE]`) and a short Korean description.
- In `*.keys.ts`, group query key helpers under a `Query Keys` section. If params are normalized, add a separate normalization section.
- In `core/*.domain.ts`, group domain schemas by UI/domain purpose.
- In `types/index.ts`, group final UI-ready types, query params, admin types, and payload types.
- Keep comments structural and concise. Do not add comments that merely repeat a single variable or type name.

---

## DTO and Domain

DTOs (in `infrastructure/`) represent raw API responses.
Choose one of the two approaches below based on whether transformation is needed.

### Approach 1 — No transformation

Do NOT create a domain schema.
Export the type directly from the DTO in `types/index.ts`.

```ts
// types/index.ts
export type UnreadCount = z.infer<typeof dto.unreadCount>;
```

### Approach 2 — With transformation

Transformation is typically three stages: an **adapter** validates the API envelope/DTO (`infrastructure/{domain}.adapters.ts`), a **factory** parses it into the domain schema (`core/{domain}.factory.ts` against `core/{domain}.domain.schema.ts`), and optional **mappers** (`mapper/`) derive display values.

Step 1. Define a pure schema in `core/{domain}.domain.schema.ts`.
Shape only — do NOT import DTO inside the domain schema.

```ts
// core/{domain}.domain.schema.ts
const NotificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  categoryKorean: z.string(),
  relativeTime: z.string(),
  isRead: z.boolean(),
});
```

Step 2. Keep transformation in `infrastructure/{domain}.adapters.ts` / `core/{domain}.factory.ts`, not in the domain schema file.

```ts
// core/{domain}.factory.ts
const createFrontendMember = (raw: CreateMemberInput) => domain.schema.parse(raw);
```

---

## Dependency Direction

Dependency must always flow in this direction. Do not reverse.

Step 1. infrastructure (dto, adapters, repository)
Step 2. core (domain schema, factory)
Step 3. types/index.ts
Step 4. UI components (features)

> This direction is a convention. It is NOT enforced by ESLint.

---

## Rules

Rule 1. Do NOT export DTO types outside the repository.
`types/index.ts` must always export the final UI-ready type only.

Rule 2. `domain.ts` must NOT import from infrastructure.
Correct direction: infrastructure → core.

Rule 3. UI components must always consume types from `types/index.ts`,
regardless of whether transformation occurred.

Rule 4. Do NOT modify existing patterns (`FrontendXxx`, `XxxDTO` exports).
When fixing bugs, follow the surrounding code's conventions.

---

## Repository Implementation Pattern

Parse all API responses with `unwrapEnvelope`.

```ts
import { unwrapEnvelope } from '@/shared/lib/api-utils';

const response = await api.private.get('/endpoint');
return unwrapEnvelope(response, dto.schema);
```

---

## TanStack Query Keys

All query keys must be defined in `{domain}.keys.ts`.
Do NOT write query keys inline in hooks.

```ts
// DO NOT
useQuery({ queryKey: ['notification', 'list'] });

// DO
useQuery({ queryKey: notificationKeys.list() });
```
