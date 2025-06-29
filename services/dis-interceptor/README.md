# dis-interceptor

Discord HTTP Proxy.

## TODO

- [ ] IPv6 DNS
- [ ] if IPv6 is available, use one address per token
  - <https://nodejs.org/api/http.html#http_http_request_options_callback>
  - <https://github.com/sindresorhus/got/blob/main/documentation/2-options.md>
  - <https://github.com/discordeno/discordeno/blob/ec1d30363e1ed337541da03a55969d47301b0bfa/packages/rest/src/manager.ts#L561>

## Development

```bash
bun dev
```

## Env

```bash
BUN_CONFIG_DNS_TIME_TO_LIVE_SECONDS=60
```
