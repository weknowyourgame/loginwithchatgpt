# TypeScript Strict Mode Example

Tests type safety and TypeScript strictness.

## What This Tests

- TypeScript strict mode: true
- All exported types
- Generic types for TokenStore
- Discriminated unions (AuthStatus)
- Optional properties
- Error handling types
- Async/await types
- No `any` usage

## How to Run

```bash
cd examples-qa/typescript-strict
npm install
npm run type-check # Run tsc --noEmit in strict mode
npm run build # Compile to JavaScript
node dist/index.js # Run compiled code
```

## Configuration

tsconfig.json with all strictness options:
```json
{
 "compilerOptions": {
 "strict": true,
 "noImplicitAny": true,
 "strictNullChecks": true,
 "strictFunctionTypes": true,
 "strictPropertyInitialization": true,
 "noImplicitThis": true,
 "alwaysStrict": true,
 "exactOptionalPropertyTypes": true,
 "noUncheckedIndexedAccess": true,
 "noImplicitReturns": true,
 "noUnusedLocals": true,
 "noUnusedParameters": true
 }
}
```

## Testing Scenarios

All of these should compile without errors:

1. **Session type**: `Session` has required `status: "connected"`
2. **Optional fields**: `account.email` is optional
3. **Token union**: `Tokens` properties are all defined
4. **Auth status**: `AuthStatus` is discriminated
5. **Error handling**: `Error` types are correct
6. **Store interface**: `TokenStore` generic is sound
7. **Options types**: `LoginOptions`, `RespondOptions` are complete

## Common TS Errors (Should NOT occur)

- Object is possibly 'undefined' (should use optionals correctly)
- Parameter implicitly has type 'any'
- Function lacks ending return statement
- Property missing from type
- Type not assignable to type

## DX Review

This example rates:
- Type inference quality
- Error message clarity
- IDE autocomplete accuracy
- Documentation in types
