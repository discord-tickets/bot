# Architecture

## Overview

v5 will likely be the last complete rewrite of the project and will use a microservices architecture.

### Goals

Some of the reasons for rewriting and the chosen architecture are:

- [x] **Easy maintenance**
  - [x] The codebase should be maintainable in the long term with minimal effort.
  - [x] v5 code will be more durable with types and *some* tests and documentation.
  - [x] Microservices will allow for incremental improvements and refactoring.
- [ ] **Easy to extend**
  - [ ] New features should be easy to add without significant refactoring,
  both for this project and for forks.
- [ ] **Observability & reliability**
  - [ ] v4 is difficult to monitor and debug.
  v5 will have instrumentation for logs, metrics, and traces.
- [x] **Multi-tenancy**
  - [x] v4 Managed instances are becoming very difficult and less profitable to manage.
  Multi-tenancy will allow a single Cloud instance to serve multiple applications/bots
  with very low overhead and the relative simplicity of managing a single deployment.
- [x] **Scalability & performance**
  - [x] v5 is the first version to be designed as cloud-first with a focus on scalability.
  Microservices could eventually allow for horizontal scaling.
- [x] **Availability**
  - [ ] Microservices could be distributed to form a highly available cluster.
  - [ ] Zero-downtime rollouts or at least short-downtime updates could be possible.
- [x] **Learning**
  - [x] Learn something new.

## Eventual plan

### Cloud

This deployment could probably scale to over a million guilds
and sustain [99.999%](https://uptime.is/five-nines) availability just by increasing node resources and adding nodes.

It requires at least 3 nodes as several stateful services use
RAFT/quorum/consensus algorithms for high-availability clusters.
More nodes increase availability, but scaling 3 nodes vertically is probably more effective for performance.
Deployed with Terraform and Nomad.

- ?x LGTM
  - Observability stack
- 3+ `consul` (HA)
  - Service discovery
  - Storage for leases, configs, etc
- 3+ `tikv` (HA)
  - KV store for Surreal
- 3+ `valkey` (HA)
  - Cache & Queues/Streams
- 2x `surrealdb`
  - Multi-model database backed by TiKV
  - Instances are stateless, all state is stored in TiKV
- ?x `vault`
  - Token storage
- 3+ `gateway`
  - Establish websocket connections to Discord
  - Each shard is locked/leased from Consul
  - Forward events to stateless consumers
  - Can be drained to transfer shards to another instance with no downtime
  (but elevated latency)
  - More instances reduces the number of shards orphaned by a single-instance failure.
- 2x consumers
  - Most microservices will be stateless, requiring either 2 load-balanced instances
  or a single instance with automatic failover.

B2 for object storage.

### Self-hosted

To reduce overhead memory usage, an `aio` (all-in-one) service will run every other service
(except disabled optional services) in worker threads.
This would be deployed with Docker Compose alongside ValKey (Redis) and MinIO (S3).

Alternatively, abstraction and emulation layers could allow a zero-dependency standalone binary.
SurrealDB can already be embedded, supporting both S3 and File System storage is trivial,
the biggest problem is replicating the required functionality of ValKey.

- <https://www.npmjs.com/package/lru-cache>
- <https://yomguithereal.github.io/mnemonist/lru-cache>
- <https://www.npmjs.com/package/@isaacs/ttlcache>
- Worker messages
- Unix sockets

## Current plan

A v5 Cloud deployment is needed urgently to replace the v4 Public and Managed instances.

The above Cloud plan is a bit overkill, both for scale and availability.

Although availability is much more important for a ticket bot than most other bots,
99.999% or even 99.99% is excessive:

- Hetzner only commits to [99.9%](https://uptime.is/three-nines) uptime
  - Although, I've had a server running for 4 years with no downtime
- Discord's uptime is probably less than [99.95%](https://uptime.is/99.95)

With only 1 node (and no HA clusters), the microservice architecture could
probably sustain an uptime of over [99.95%](https://uptime.is/99.95).
But even [99%](https://uptime.is/two-nines) would be better than
the v4 Public instance's [95%](https://uptime.is/95)...

To mitigate the risk of sustained downtime due to the single node failing,
all state will be stored in block volumes to allow for manual node failover if necessary.

In addition to simpler deployment (no TiKV or ValKey clusters),
this completely eliminates the need for Consul. Vault will also be removed.
