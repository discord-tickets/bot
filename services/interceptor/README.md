# interceptor

Multi-application proxy for the Discord API.

## TODO

- <https://discordeno.js.org/docs/bigbot/step-2-rest#multiple-custom-bot-proxy-rest>
- [ ] IPv6 DNS
- [ ] if IPv6 is available, use one address per token
  - <https://nodejs.org/api/http.html#http_http_request_options_callback>
  - <https://github.com/sindresorhus/got/blob/main/documentation/2-options.md>
  - <https://github.com/discordeno/discordeno/blob/ec1d30363e1ed337541da03a55969d47301b0bfa/packages/rest/src/manager.ts#L561>
- [ ] get base URL (API version) from Consul KV
