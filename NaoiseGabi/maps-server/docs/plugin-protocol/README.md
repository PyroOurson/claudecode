# Plugin protocol schemas

JSON Schemas (draft 2020-12) for every message between maps-server and a plugin. The protocol itself is described in the main README, under "Plugin protocol".

| File | Message |
| --- | --- |
| `request.schema.json` | A request from the server: `mode`, `attribution`, `available` or `explore`. |
| `mode-reply.schema.json` | The reply to `mode`. |
| `attribution-reply.schema.json` | The reply to `attribution`. |
| `available-reply.schema.json` | The reply to `available`. |
| `explore-reply.schema.json` | The reply to `explore`. |
| `error-reply.schema.json` | An error reply to any request. |

To check a running plugin against the same rules, plus things a schema cannot express (every `to` is a listed station, response times), run:

```
maps-server check-plugin .#plugins.<name>
maps-server check-plugin -- python3 main.py
```
