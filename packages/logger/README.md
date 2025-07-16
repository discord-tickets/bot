# logger

## Levels

- trace
- debug
- info
- warn
- error
- fatal

## Style

Messages should be as short as possible without compromising the usefulness of the information.
They do not need to be grammatically correct sentences.

## Usage

> [!WARNING]
> Context objects should not include reserved properties:
> time, msg, service

```ts
// should be imported from service pkg
import { log } from '@discord-tickets/service';

// just strings
log.info('a message');
log.info('a message with %s', 'interpolation');

// with context
log.debug({ something: true }, 'a message with context');

// errors
log.error(new Error('oops'));
log.error(new Error('oops'), 'something went wrong');

// `err`, `req`, and `res` objects in the context
// have special formatting
log.error({
    err: new Error('oops'),
    req,
    res,
}, 'something went wrong');

req.log = log.child({ req });
req.info('something happened'); // context will include `req`

// ❌ INVALID:
log.info('a message with', 'automatic', 'interpolation'); // doesn't work
```
