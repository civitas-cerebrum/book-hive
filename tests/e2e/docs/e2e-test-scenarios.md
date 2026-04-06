# Negative Test Coverage Tracking

## Risk Score Table

| Page | Tier | tier_weight | page_criticality | data_sensitivity | risk_score |
|------|------|-------------|------------------|------------------|------------|
| /cart | T1 | 3 | 3 | 3 | 27 |
| /marketplace/sell | T1 | 3 | 2 | 3 | 18 |
| /login | T1 | 3 | 3 | 2 | 18 |
| /signup | T1 | 3 | 3 | 2 | 18 |
| /marketplace | T2 | 2 | 2 | 2 | 8 |
| /orders/:id | T2 | 2 | 2 | 2 | 8 |
| /orders | T2 | 2 | 2 | 1 | 4 |
| /profile | T2 | 2 | 1 | 2 | 4 |
| /books/:id | T3 | 1 | 1 | 1 | 1 |
| / | T3 | 1 | 1 | 1 | 1 |
| /?query=\<term\> | T3 | 1 | 1 | 1 | 1 |
| /?genre=\<genre\> | T3 | 1 | 1 | 1 | 1 |

## Per-Page Coverage

| Page | Risk | T1:Empty | T1:Type | T1:Boundary | T1:Injection | T1:Duplicate | T2:Session | T2:Prereq | T2:Stale | T2:Permission | T2:Concurrent | T3:Empty | T3:Overflow | T3:DeadEnd | T3:Undo | Notes |
|------|------|----------|---------|-------------|--------------|--------------|------------|-----------|----------|---------------|---------------|----------|-------------|------------|---------|-------|
| /cart | 27 | n/a | n/a | n/a | n/a | done | done | done | done | done* | done | done | n/a | done | done | No form inputs. Mutation buttons tested (checkout, clear, remove, qty+/-). *Permission in functional spec |
| /marketplace/sell | 18 | done | done | done | done | done | done | n/a | n/a | done* | n/a | n/a | done | done | n/a | Price is number input — XSS inherently blocked by browser. *Permission in functional spec |
| /login | 18 | done | done | done | done | done | n/a | n/a | n/a | n/a | n/a | n/a | done | done | n/a | Public page — no session/permission tests needed |
| /signup | 18 | done | done | done | done | done | n/a | n/a | n/a | n/a | n/a | n/a | done | done | n/a | Public page — no session/permission tests needed |
| /marketplace | 8 | n/a | n/a | n/a | n/a | n/a | done* | n/a | n/a | n/a | n/a | done | n/a | done | n/a | Read-only page with buy action. *Session via buy-action guard |
| /orders/:id | 8 | n/a | n/a | n/a | n/a | n/a | done* | done | n/a | done | n/a | n/a | n/a | done | done | *Session covered via /orders redirect. Permission: cross-user order access blocked |
| /orders | 4 | n/a | n/a | n/a | n/a | n/a | done | n/a | n/a | done* | n/a | done | n/a | done | n/a | Read-only list. *Permission in functional spec |
| /profile | 4 | n/a | n/a | n/a | n/a | n/a | done | n/a | n/a | done* | n/a | done | n/a | done | n/a | Read-only. *Permission in functional spec |
| /books/:id | 1 | n/a | n/a | n/a | n/a | n/a | n/a | done | n/a | n/a | n/a | n/a | n/a | done | n/a | Public read-only page. Missing prereq: nonexistent book shows not-found |
| / | 1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | done | done | done | n/a | Public read-only page with search input. Overflow tested on search |
| /?query=\<term\> | 1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | done | done | done | n/a | Search results page — empty state & overflow tested |
| /?genre=\<genre\> | 1 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | done | n/a | done | n/a | Genre filter page — empty state & back nav tested |

### Marking Rules
- **done** — Test written, runs, passes.
- **n/a** — Category does not apply (reason documented in Notes column).
- **done*** — Covered via related spec (functional permission-gated or transitive session test).

## Test Distribution

| Spec File | Tests | Categories |
|-----------|-------|------------|
| negative-cart.spec.ts | 6 | T1: Duplicate submission (checkout, clear, remove, qty+/-, add-to-cart) |
| negative-sell.spec.ts | 9 | T1: Empty, Type, Boundary, Injection, Duplicate (sell form) |
| negative-login.spec.ts | 18 | T1: Empty (3), Type (2), Boundary (3), Injection (8), Duplicate (1), plus SQL injection in password |
| negative-signup.spec.ts | 20 | T1: Empty (4), Type (2), Boundary (4), Injection (8), Duplicate (1), plus special chars in username |
| negative-state.spec.ts | 10 | T2: Expired session (4), Missing prereqs (4), Stale refs (1), Concurrent mutation (1) |
| negative-ux.spec.ts | 25 | T3: Empty states (7), Overflow (7), Navigation dead ends (8), Undo/recovery (3) |
| **Total** | **88** | All tiers covered across all 12 pages |

## Completion Criteria

1. ✅ Every page has a row in the table.
2. ✅ Every cell is `done`, `n/a` (with reason), or `done*` (with reference).
3. ✅ No blank cells remain.
4. ✅ All `done` tests pass in the test suite (88 passed, 0 failed).
5. ✅ Experiential notes appended to every spec file.
