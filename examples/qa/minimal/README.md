# Minimal Example: 20-Line Quickstart

The absolute simplest way to authenticate and call ChatGPT.

## What This Tests

- Minimal API surface
- Loopback OAuth
- Session restore
- API call
- Error handling

## How to Run

```bash
cd examples-qa/minimal
npm install
node index.js
```

Authenticates, makes one API call, and exits.

## Code

```javascript
import { login, getSession, createClient } from "loginwithchatgpt";

const cmd = process.argv[2];
if (cmd === "login") {
 await login();
 console.log(" Authenticated");
} else {
 const s = await getSession();
 if (!s) {
 console.log(" Not logged in. Run: node index.js login");
 process.exit(1);
 }
 const c = createClient();
 console.log(await c.respond("Hello!"));
}
```

## Expected Output

```
$ node index.js login
# Browser opens...
# After approval:
 Authenticated

$ node index.js
[ChatGPT response here...]
```
