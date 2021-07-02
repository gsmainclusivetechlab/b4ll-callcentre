# Testing Guide

## Jest

This project uses Jest as the testing framework. Test files are located in
parrarel with the file being tested (e.g `index.ts` & `index.test.ts`).
Documentation for jest can be found
[here](https://jestjs.io/docs/getting-started).

### Creating a new test

1. To create a new test, create a new file `*.test.ts`
2. Import the required functions (mock handler etc.) as well as anything else
   needed for your test:

```javascript
import * as handler from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
```

3. Define `get` or `post` variables:

```javascript
const get = mockHandlerFn(handler.get);
const post = mockHandlerFn(handler.post);
```

4. Begin to write your tests using jest's `describe()` method. The example below
   shows an example of a test for one of our handlers (`root/index.ts`):

```javascript
describe('Greeting message', () => {
    test.each`
        type       | user                    | message            | redirect
        ${'users'} | ${{ isEnrolled: true }} | ${'welcome-known'} | ${'./en-DEV/menu'}
    `('should greet $type', async ({ user, message, redirect }) => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-root-test', ...user },
        });
        expect(result.toString()).toContain(message);
        expect(result.toString()).toContain(redirect);
        expect(result.toString()).toMatchSnapshot();
    });
});
```

### Running tests

-   Run `yarn test` to run unit tests
-   Run `yarn test --watch` to run unit tests and automatically re-run tests on
    code changes
-   Add `--coverage` to the command to also calculate test coverage for your
    code
-   Add `--updateSnapshot` to automatically update any changed snapshots (but
    ensure to check the changes are correct before committing the code!)
