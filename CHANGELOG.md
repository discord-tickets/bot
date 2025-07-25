## [4.0.46](https://github.com/discord-tickets/bot/compare/v4.0.45...v4.0.46) (2025-07-25)


### Bug Fixes

* staff offline message not displaying (fixes [#641](https://github.com/discord-tickets/bot/issues/641)) ([#642](https://github.com/discord-tickets/bot/issues/642)) ([cb22a92](https://github.com/discord-tickets/bot/commit/cb22a9271c8e31da29de7237cf1b64158ad1eb74))


### Reverts

* Revert "fix: enable stale handling when public" ([416201b](https://github.com/discord-tickets/bot/commit/416201b72426eeabecb4b7aec77e285f148e3c0f))



## [4.0.45](https://github.com/discord-tickets/bot/compare/v4.0.44...v4.0.45) (2025-07-24)


### Bug Fixes

* enable stale handling when public ([48fa871](https://github.com/discord-tickets/bot/commit/48fa8713a8c39d9825dbca7702d640dee048f03e))
* **i18n:** Danish translations ([ed02f8b](https://github.com/discord-tickets/bot/commit/ed02f8baa4d146cdac2a836a5389457db9b91cd7))
* log when sentry is enabled ([1809815](https://github.com/discord-tickets/bot/commit/1809815de88dd26287185765ff9dffa7d51bc3c7))


### Features

* `CPU_LIMIT` env ([271efd9](https://github.com/discord-tickets/bot/commit/271efd933b92b9e4cb7b37029a98d6df1fa25c7e))
* add avgRating to default config ([08516d1](https://github.com/discord-tickets/bot/commit/08516d1bab6d6af5b21752d01e5738cab93ed239))
* average rating stat ([651251d](https://github.com/discord-tickets/bot/commit/651251de37ecc5d70d55b840424c318703bbc1e1))
* **i18n:** update Danish translations ([3068ae8](https://github.com/discord-tickets/bot/commit/3068ae8a37a247693d42175d55d4163ae2a4b3f3))
* **i18n:** update Danish translations ([526518f](https://github.com/discord-tickets/bot/commit/526518fc147517b98d814ad9ecb0c76c9bd9a8f5))
* **i18n:** update German translations ([b950c81](https://github.com/discord-tickets/bot/commit/b950c81eee4a950459a5792354dcd99e65b2ce6b))
* **i18n:** update Russian translations ([ffa7d08](https://github.com/discord-tickets/bot/commit/ffa7d083bcdaba4cc3a11159ddb829e157c622d7))


### Performance Improvements

* export handling and add sentry ([#638](https://github.com/discord-tickets/bot/issues/638)) ([50a9ea6](https://github.com/discord-tickets/bot/commit/50a9ea61a982b2bf52123215e89cb954884d3f84))



## [4.0.44](https://github.com/discord-tickets/bot/compare/v4.0.43...v4.0.44) (2025-07-04)


### Bug Fixes

* `/tickets` command ([220ca64](https://github.com/discord-tickets/bot/commit/220ca647354ace01ac25da3d89fecce668178d13))
* accidently left timer at 15s instead of 15m 🤦‍♂️ ([1220d72](https://github.com/discord-tickets/bot/commit/1220d728c18f243a4b00d65e59097b597540bcd3))



## [4.0.43](https://github.com/discord-tickets/bot/compare/v4.0.42...v4.0.43) (2025-07-02)


### Bug Fixes

* disable stale ticket handling on public bots ([a5d4098](https://github.com/discord-tickets/bot/commit/a5d409860c27fd0da7305fe8a4672d62cf89725b))


### Features

* **i18n:** update Thai translations ([b363f36](https://github.com/discord-tickets/bot/commit/b363f365052474d28dbd8584a42f591c1503a169))



## [4.0.42](https://github.com/discord-tickets/bot/compare/v4.0.41...v4.0.42) (2025-07-01)


### Performance Improvements

* shared thread pools ([270a641](https://github.com/discord-tickets/bot/commit/270a641c07430344c223a125e67705e1a8ced549))



## [4.0.41](https://github.com/discord-tickets/bot/compare/v4.0.40...v4.0.41) (2025-06-30)


### Bug Fixes

* error handling ([1906a94](https://github.com/discord-tickets/bot/commit/1906a94d0add8cf1e252fd92b035e96d6e6e0ba8))
* stale tickets with no messages, auto close timestamp, loop perf ([365163c](https://github.com/discord-tickets/bot/commit/365163ca32eeaf01eb316e6c5330b7294a1ce88d))


### Features

* `DISABLE_ENCRYPTION` option ([#622](https://github.com/discord-tickets/bot/issues/622)) ([91323fc](https://github.com/discord-tickets/bot/commit/91323fc3b0aee8cb76d9a548ee4e650215477b5c))
* **i18n:** add Ukrainian translations ([#618](https://github.com/discord-tickets/bot/issues/618)) ([809f733](https://github.com/discord-tickets/bot/commit/809f733a98b1f70751481551ed706d436560f8d7))
* **i18n:** update Russian translations ([56373c4](https://github.com/discord-tickets/bot/commit/56373c427a67f4bc3245bee4079b1f3fcaf93c03))
* **i18n:** update Ukrainian translations ([2eb8cf0](https://github.com/discord-tickets/bot/commit/2eb8cf0588a622489b7c2bf452872abd2ad0ee68))
* log on interval ([3daccc7](https://github.com/discord-tickets/bot/commit/3daccc7ae8e802e9ef4bdfa8d2fdaef461644d3d))



## [4.0.40](https://github.com/discord-tickets/bot/compare/v4.0.39...v4.0.40) (2025-05-23)


### Bug Fixes

* 1h guild timeout ([51a6c1a](https://github.com/discord-tickets/bot/commit/51a6c1a73e70aceed59afe47f2f8157a228f3961))



## [4.0.39](https://github.com/discord-tickets/bot/compare/v4.0.38...v4.0.39) (2025-05-23)


### Bug Fixes

* triple guild timeout ([8150084](https://github.com/discord-tickets/bot/commit/8150084fed3abc9a02edc15a352b5ec0fef51171))


### Features

* block timed out users ([#612](https://github.com/discord-tickets/bot/issues/612)) ([6e51345](https://github.com/discord-tickets/bot/commit/6e51345e40bd8d27e2822387e4e08f7cc231f1d1))
* **i18n:** add Japanese translations ([c20c509](https://github.com/discord-tickets/bot/commit/c20c509e867cab14549086f3afa2dff0c99bd586))
* **i18n:** update Japanese translations ([088b980](https://github.com/discord-tickets/bot/commit/088b980192dc8b22888c62e4ce334a8b006d49eb))
* **i18n:** update Russian translations ([41c20d6](https://github.com/discord-tickets/bot/commit/41c20d600ed333b83275c5968b5fdf46de64fd13))
* **panels:** optional title ([f1a8530](https://github.com/discord-tickets/bot/commit/f1a85308c48fa8cded715c9eaa931579c4beee03))



## [4.0.38](https://github.com/discord-tickets/bot/compare/v4.0.37...v4.0.38) (2025-03-31)


### Bug Fixes

* **docker:** pre-create runtime directories ([#607](https://github.com/discord-tickets/bot/issues/607)) ([6375f4c](https://github.com/discord-tickets/bot/commit/6375f4c53c3b6cfbb5689594cb28e68950862a2a))
* increase timeout for missing guilds ([c94ee65](https://github.com/discord-tickets/bot/commit/c94ee655f6fe206a6e28fc5af03757f85d812782))



## [4.0.37](https://github.com/discord-tickets/bot/compare/v4.0.36...v4.0.37) (2025-03-26)


### Bug Fixes

* importing with feedback ([86ea3cc](https://github.com/discord-tickets/bot/commit/86ea3cc7fe6def137b8c2dfc40969a6225411a97))


### Features

* **i18n:** add Vietnamese translations ([be0ddbc](https://github.com/discord-tickets/bot/commit/be0ddbc17d14e9c5ee0a3251f2993a233cd022ec))
* **i18n:** update Vietnamese translations ([71094c1](https://github.com/discord-tickets/bot/commit/71094c1725549469bcc2c5738d54c40210b11939))
* **i18n:** update Vietnamese translations ([#602](https://github.com/discord-tickets/bot/issues/602)) ([3c853ea](https://github.com/discord-tickets/bot/commit/3c853ea4d6e2662672d64e185af1706c8fd1c914))



## [4.0.36](https://github.com/discord-tickets/bot/compare/v4.0.35...v4.0.36) (2025-03-18)


### Bug Fixes

* sync and close error handling ([c0bea3d](https://github.com/discord-tickets/bot/commit/c0bea3d32dfcbfa627a723ff8f8395a6e3aced31))


### Features

* **i18n:** update Czech translations ([205d1c2](https://github.com/discord-tickets/bot/commit/205d1c232971d82e73e7bc025a86e2ac6ae435a2))
* **i18n:** update Czech translations ([074ba42](https://github.com/discord-tickets/bot/commit/074ba4266eea60aa783d76573df37558a52435bd))
* **i18n:** update French translations ([42fefa9](https://github.com/discord-tickets/bot/commit/42fefa92d882179bb624fb7c27738e8480b41df5))
* **i18n:** update German translations ([#595](https://github.com/discord-tickets/bot/issues/595)) ([e30c149](https://github.com/discord-tickets/bot/commit/e30c149bc149e97bfe774694ea6eeeea80ed4e3f))



## [4.0.35](https://github.com/discord-tickets/bot/compare/v4.0.34...v4.0.35) (2025-03-06)


### Bug Fixes

* add `.zip` extension to export file name ([d8bd963](https://github.com/discord-tickets/bot/commit/d8bd9632000f003164ea970d6bfe84f7001a7fe2))
* correct tag content max length ([cdbd065](https://github.com/discord-tickets/bot/commit/cdbd065b69f819ba1b1b7535414a96fd571fa71d))



## [4.0.34](https://github.com/discord-tickets/bot/compare/v4.0.33...v4.0.34) (2025-03-05)


### Bug Fixes

* `send()` user create button if possible ([eaa970f](https://github.com/discord-tickets/bot/commit/eaa970fd010f044ead70a4d70d2dae9652d803af))
* **api:** service keys ([07c4e9a](https://github.com/discord-tickets/bot/commit/07c4e9a5eec6df39cd230dfc7967466f9c5df3e2))
* decrypt feedback comment in close log ([3273f90](https://github.com/discord-tickets/bot/commit/3273f90902fbdfc149aaa9d1d564df291753bbc4))
* duplicate reason in close log ([2c05460](https://github.com/discord-tickets/bot/commit/2c05460684f8e587882d007dde258b9512886dda))
* feedback comment in close log ([4b951ec](https://github.com/discord-tickets/bot/commit/4b951ec57862f9108e42c390f1ebc0d1f2296a7b))
* feedback in close log ([1989706](https://github.com/discord-tickets/bot/commit/1989706d266eccdd82615fd66c19ae71b6d0fc98))
* importing a ticket with question answers ([4fe0e68](https://github.com/discord-tickets/bot/commit/4fe0e682fdc34b29afed3321ae4fa3f7bb1b963d))
* only allow referencing messages with `content` ([ec4a701](https://github.com/discord-tickets/bot/commit/ec4a701651d01f5bd458983459a9ff7c4d0f912c))
* panel emoji error handling ([ec5179c](https://github.com/discord-tickets/bot/commit/ec5179cc4163704c43df5366e71b13029b66f9e0))
* public bot warning condition ([f963203](https://github.com/discord-tickets/bot/commit/f96320399fcf752fc56b303c1b87d21bdb302751))
* user/create command when there is a single category ([2b02edd](https://github.com/discord-tickets/bot/commit/2b02edd27b4f3b77b0bbce2bf7d2df44e03ad92f))


### Features

* allow anyone to use create button sent for a specific user ([6274f66](https://github.com/discord-tickets/bot/commit/6274f66d447f7c3a3bfb1ddf0a4a9effeb020897))
* detailed ticket close log message ([27d17fb](https://github.com/discord-tickets/bot/commit/27d17fb4ce7450f1f6c93c0d92f580c3edba3139))
* **i18n:** update French translations ([df0d3a7](https://github.com/discord-tickets/bot/commit/df0d3a7e12c02feb6cad363a687e821549733632))
* **i18n:** update German translations ([d4ea64c](https://github.com/discord-tickets/bot/commit/d4ea64c0d5a3d9ef11f326134e8fa7a82e975493))
* **i18n:** update German translations ([83a77bc](https://github.com/discord-tickets/bot/commit/83a77bcf54ae14e643a806890898c104ccf442a5))
* **i18n:** update German translations ([72120e9](https://github.com/discord-tickets/bot/commit/72120e902597b52077347ed1995af7ba896a96af))
* **i18n:** update translation files ([5d43806](https://github.com/discord-tickets/bot/commit/5d4380698f99f169d57a6ddbe0bd1df3aefd97ea))
* inline log when editing question answers ([cb30171](https://github.com/discord-tickets/bot/commit/cb30171ee71c7ef6f58861e04aefe80d4a6ca32e))
* shorter max topic length (100) ([96775df](https://github.com/discord-tickets/bot/commit/96775dfabcc36407f4d30631f3013390cf0107c2))



## [4.0.33](https://github.com/discord-tickets/bot/compare/v4.0.32...v4.0.33) (2025-02-18)


### Bug Fixes

* known error handling (permissions and unknown roles) ([cc5c0b0](https://github.com/discord-tickets/bot/commit/cc5c0b028b3ec3d556e6aa4db06de52633e9d66f))


### Features

* question answers in transcripts ([800f269](https://github.com/discord-tickets/bot/commit/800f269a819ec56f3d4fa84a2a1f0107809c634a))



## [4.0.32](https://github.com/discord-tickets/bot/compare/v4.0.31...v4.0.32) (2025-02-15)


### Bug Fixes

* archiving messages with mentioned users ([8f46e5b](https://github.com/discord-tickets/bot/commit/8f46e5ba2c1f67eb847cd76ac882209fe1f1529e))


### Features

* specific message for permission errors ([f622cfe](https://github.com/discord-tickets/bot/commit/f622cfe4481d00bfefbd951f0904e18c4ca77da6))



## [4.0.31](https://github.com/discord-tickets/bot/compare/v4.0.30...v4.0.31) (2025-02-15)


### Bug Fixes

* `/claim` and `/release` commands (from [#580](https://github.com/discord-tickets/bot/issues/580)) ([20a0b93](https://github.com/discord-tickets/bot/commit/20a0b9378bc7a3393b53d9e0a092ec709c663d96))
* **api:** guild not global ticket count ([53df394](https://github.com/discord-tickets/bot/commit/53df394a480fab74f6b58182e0f7df87954faa54))
* can't set ephemeral after deferring ([7b8c5ff](https://github.com/discord-tickets/bot/commit/7b8c5ff9c092a2008bf8d2ab04a47e2f8adb1f68))
* ephemeral reply to `/topic` ([d57d20d](https://github.com/discord-tickets/bot/commit/d57d20dfd8bb9472235d0d27abd908db0e298ba5))
* handle missing ticket on`/move` and `/transfer` ([1f24561](https://github.com/discord-tickets/bot/commit/1f24561ac0f22031b5ff27bf3df3961082e31040))
* **prune:** don't delete recently-added guilds ([73ff67c](https://github.com/discord-tickets/bot/commit/73ff67c65f2ca1f2f0ebf3ac1d4f195a8d58e037))


### Features

* allow `/transcript` to accept numbers as well as IDs ([5a66c31](https://github.com/discord-tickets/bot/commit/5a66c31494ba49edf8ff3ac7221b814e519684e0))
* db prune script (closes [#322](https://github.com/discord-tickets/bot/issues/322)) ([f140b76](https://github.com/discord-tickets/bot/commit/f140b76a922653345d0bfd311128f064a72c5d01))
* **i18n:** update German translations ([e75119f](https://github.com/discord-tickets/bot/commit/e75119fb2b43eb86e48a387b683cbdb48e2b76f3))
* **i18n:** update Italian translations ([a38eed8](https://github.com/discord-tickets/bot/commit/a38eed87c928be7fc04bc320e2d6c93f5262f30e))



## [4.0.30](https://github.com/discord-tickets/bot/compare/v4.0.29...v4.0.30) (2025-02-13)


### Bug Fixes

* catch unknown member error ([64ed170](https://github.com/discord-tickets/bot/commit/64ed1703322b3ad551210ec680223227f7657168))
* message delete error catching ([8cc708e](https://github.com/discord-tickets/bot/commit/8cc708e68f9aa35168668d6686fc35eba3d4cbe3))
* **portal:** `/invite` when not logged in ([46bee39](https://github.com/discord-tickets/bot/commit/46bee3921b148f1ea5aa279ab473bad0f3cfc7f7))



## [4.0.29](https://github.com/discord-tickets/bot/compare/v4.0.28...v4.0.29) (2025-02-13)


### Bug Fixes

* `/move` into new category (fixes [#531](https://github.com/discord-tickets/bot/issues/531)) ([c1643f4](https://github.com/discord-tickets/bot/commit/c1643f45ad435087f128ce107d306e397228150a))
* `references` option on the `/new` command ([37ece87](https://github.com/discord-tickets/bot/commit/37ece87b4e8c2774a55d4c4c663abccf6a37cfac))
* **api/stats:** guild ticket count ([5a908e7](https://github.com/discord-tickets/bot/commit/5a908e77a76ad3ef4cf484705b29c9261a104706))
* **api:** missing archived messages etc in exports ([9689648](https://github.com/discord-tickets/bot/commit/9689648a6c4dd1e05ed664f7be499f3c0d834124))
* **api:** move guild delete route to index ([4278d24](https://github.com/discord-tickets/bot/commit/4278d24e0b5085f21ce15b06a5e0c8265c8b8fd3))
* houston ([a09f98f](https://github.com/discord-tickets/bot/commit/a09f98faaebf5a46409d1c7eaade95a35677fe49))
* **i18n:** rename en_US to en-US ([b7531b0](https://github.com/discord-tickets/bot/commit/b7531b04c4e00833cbf2f749a7234d1c885192cc))
* invite buttons ([33c1b64](https://github.com/discord-tickets/bot/commit/33c1b64019395953d2a1071ded1fffdaded6e7e6))
* move `/invite` from api to app ([2ed25f7](https://github.com/discord-tickets/bot/commit/2ed25f7bbffcab8da345e2982dba1ac689037768))
* **not really:** catch working hours errors ([bb31242](https://github.com/discord-tickets/bot/commit/bb31242d6b47bd10008040e527d3fb50157c1c74))
* only send transcript button if archiving is enabled ([618f35f](https://github.com/discord-tickets/bot/commit/618f35f247ed4705769dd80607078bd7480e4eda))
* only send transcript button in log channel if archiving is enabled ([54455c3](https://github.com/discord-tickets/bot/commit/54455c316e5555387c98c36170430f88c9b1c327))
* re-enable `prompt=none` ([764a8aa](https://github.com/discord-tickets/bot/commit/764a8aac377c46bc8c77e4894223ed69de5c665f))
* **scripts:** remove `categoryId` when importing questions ([b2d6413](https://github.com/discord-tickets/bot/commit/b2d641322119e4e51ff8d0242cf444b4a7f5563f))
* **stats:** should have retested that... ([c185afc](https://github.com/discord-tickets/bot/commit/c185afcdfea8d90fd0f9b529dcf6113bd2bfc94c))
* suppress message delete error ([43fe302](https://github.com/discord-tickets/bot/commit/43fe3028b196b53926dbf806df4919b168b75627))
* use descending date format in logs to avoid confusion ([f29c4ac](https://github.com/discord-tickets/bot/commit/f29c4ac76576177d4d12af7ba14773a0553fd602))


### Features

* `/rename` command  ([#583](https://github.com/discord-tickets/bot/issues/583)) ([aae41ff](https://github.com/discord-tickets/bot/commit/aae41ffee3fc70d75aff0fdab27282f9aac3d11d))
* `number` placeholder in opening message ([e53c064](https://github.com/discord-tickets/bot/commit/e53c064bf7901472409c7e6d7185274fc3cf9fbb))
* add `guilds` placeholder to activities ([c6b9714](https://github.com/discord-tickets/bot/commit/c6b9714f37179567bf6673c3d7dbdaebb26890c7))
* **api:** data imports ([9ad6d6e](https://github.com/discord-tickets/bot/commit/9ad6d6e57289509e336ec55b3ac423f15881ea5b))
* **api:** export data as zip ([f029a49](https://github.com/discord-tickets/bot/commit/f029a4987796e82ac5b6ca113f3376c3d7a2096c))
* **api:** public bot warning ([96cc84e](https://github.com/discord-tickets/bot/commit/96cc84e13ca6130f7235cffc36aaecbe7284e538))
* close reason in log embed ([a711fc7](https://github.com/discord-tickets/bot/commit/a711fc7be69ec91168773f343654298c969672cb))
* **eggs:** add pelican egg and move to dedicated directory ([#579](https://github.com/discord-tickets/bot/issues/579)) ([1b42029](https://github.com/discord-tickets/bot/commit/1b4202999d7982f300653c8c23226d77ff44b53f))
* ephemeral replies on (un)claim buttons ([#580](https://github.com/discord-tickets/bot/issues/580)) ([b3a2bb0](https://github.com/discord-tickets/bot/commit/b3a2bb00a15c6a6e7c4fec690af97b883db2fa49))
* handle exit signals ([55660e8](https://github.com/discord-tickets/bot/commit/55660e8c4ee8d570c38d1fd3ce163077d2304a5a))
* **i18n:** add English (United States) translations ([85ae461](https://github.com/discord-tickets/bot/commit/85ae461a34ebafd9e7bc14f443d6468b4bad6301))
* **i18n:** add Lithuanian translations ([79dd181](https://github.com/discord-tickets/bot/commit/79dd181d633741c787a57bb3fae1f318127c9c12))
* **i18n:** improve German translations ([118b685](https://github.com/discord-tickets/bot/commit/118b685f8ea99c75bd288de739421937258f6447))
* **i18n:** update Czech translations ([05c6ffa](https://github.com/discord-tickets/bot/commit/05c6ffa4828100eaa4832bd71907a50e0578f30a))
* **i18n:** update French translations ([e7aa5f2](https://github.com/discord-tickets/bot/commit/e7aa5f23847ac86ab76eb8a97563f61c9e240026))
* **i18n:** update German translations ([c8eb0b9](https://github.com/discord-tickets/bot/commit/c8eb0b9215d803f1af9574647da43fd7baa1b4f6))
* **i18n:** update Lithuanian translations ([ffbfb0c](https://github.com/discord-tickets/bot/commit/ffbfb0c05ce6f74f816b098e56e27cb587f40efc))
* **i18n:** update Lithuanian translations ([1b88267](https://github.com/discord-tickets/bot/commit/1b882672120f989a61e670b9660c886f1222e302))
* **i18n:** update Lithuanian translations ([ab06e02](https://github.com/discord-tickets/bot/commit/ab06e029a61eb2ea1975a5643f09cd078471bcd9))
* **i18n:** update translation files ([9a7a142](https://github.com/discord-tickets/bot/commit/9a7a14295c38c5dd1c93152a0134f504b920ddc5))
* **i18n:** update Turkish translations ([71547aa](https://github.com/discord-tickets/bot/commit/71547aa1429ba5a31b18be61a58ff9a5e1328728))
* login when adding to guild, then redirect to its settings ([55b184f](https://github.com/discord-tickets/bot/commit/55b184f2265272231af6a1f9b129d7d0a55e68c5))
* lower channel delete timer to 3s ([3eef14c](https://github.com/discord-tickets/bot/commit/3eef14ccad9639298605fc2f3a8154e0a208def3))
* portal `v2.5.0` ([dcf1c83](https://github.com/discord-tickets/bot/commit/dcf1c832286e0908519e9e93238e1a5597b910a3))
* react to messages when archiving fails ([fb0a23c](https://github.com/discord-tickets/bot/commit/fb0a23cef058c918ae53a83ac8e7195611535b82))
* remove DM embed description ([f74b257](https://github.com/discord-tickets/bot/commit/f74b2576297f5c486bdec9d3c65af88cb74a8b00))
* separate user and admin auth, redirect to settings after invite ([2255d0d](https://github.com/discord-tickets/bot/commit/2255d0d15d9a0cc6088d5b19c819a49b1b013379))
* super fast database dump and restore scripts ([413bae6](https://github.com/discord-tickets/bot/commit/413bae6d2c1b74e7181e25d4a47d34bfb7e8baa3))
* transcript button in DM ([e947c95](https://github.com/discord-tickets/bot/commit/e947c9589b7b357d5386a47197d21d0ccba9c754))
* transcript button on referenced ticket embed ([04ada3c](https://github.com/discord-tickets/bot/commit/04ada3c07b41f2c658bcb3648ec58d1cd6c44d47))


### Performance Improvements

* **api:** don't return ticket after import ([440a9b7](https://github.com/discord-tickets/bot/commit/440a9b745cd0c5887a5a8e980072d020c6c4df9a))
* **api:** faster exports ([a33c670](https://github.com/discord-tickets/bot/commit/a33c670fc807ab741178054d454ca7f444967736))
* **api:** increase batch size ([a861f76](https://github.com/discord-tickets/bot/commit/a861f76df99dd369567c0118f7b1330ee79f3fa7))
* don't await archive ([673afa0](https://github.com/discord-tickets/bot/commit/673afa0ee079a877ce59bf1d9c2be50447c87c75))
* **houston:** threads for stats ([0918c58](https://github.com/discord-tickets/bot/commit/0918c58185c9fd58e38caa27bfe3ba4cf2fb78a8))
* less await ([da36ab3](https://github.com/discord-tickets/bot/commit/da36ab38cd1677dbfbdeeca0deb042c83dd54dd0))
* single transaction for archiving messages ([b5384bc](https://github.com/discord-tickets/bot/commit/b5384bca6cc1b04ad68e48d8956f64658aaaeb69))
* **stats:** don't duplicate work ([0830050](https://github.com/discord-tickets/bot/commit/08300504b149164f5d6e61cc3137d9b5abbc54a7))
* **stats:** threads, better & parallel queries ([6b0146e](https://github.com/discord-tickets/bot/commit/6b0146e0997612602c0f161195167f090dc15a6f))
* threads everywhere! (for encryption & decryption) ([d99cb20](https://github.com/discord-tickets/bot/commit/d99cb202d57c032a62b349037aae766ef8216fd0))
* upgrade to prisma 5 ([8ac7c65](https://github.com/discord-tickets/bot/commit/8ac7c65a2dd3ccc4e6c79bd6b4db3e1fabee8ee2))



## [4.0.28](https://github.com/discord-tickets/bot/compare/v4.0.27...v4.0.28) (2025-01-14)


### Features

* **api:** reorderable categories in panels ([5ffd189](https://github.com/discord-tickets/bot/commit/5ffd18961b1342d546da3b1c278569004a36c54b))
* portal `v2.4.0` ([b756df0](https://github.com/discord-tickets/bot/commit/b756df0c3b6551df01d9142c273b2b264443369e))



## [4.0.27](https://github.com/discord-tickets/bot/compare/v4.0.26...v4.0.27) (2025-01-13)


### Bug Fixes

* **scripts:** dependencies shouldn't be dev-only ([45f21f5](https://github.com/discord-tickets/bot/commit/45f21f5da9de179a6d9b13ccc46663b7fc28227c))
* **scripts:** don't encrypt/decrypt missing values ([87b9974](https://github.com/discord-tickets/bot/commit/87b9974dbdbabcb7939a224e6b1a6f20de231af8))



## [4.0.26](https://github.com/discord-tickets/bot/compare/v4.0.25...v4.0.26) (2025-01-10)


### Features

* **scripts:** data export and import scripts ([#575](https://github.com/discord-tickets/bot/issues/575)) ([03f3944](https://github.com/discord-tickets/bot/commit/03f3944d31ec69041d406e12151f9b3e1c8fe48a))
* **scripts:** npm shortcuts for export and import ([9a2912d](https://github.com/discord-tickets/bot/commit/9a2912d0d3d328ebb685cd11dc780dd677c9b595))



## [4.0.25](https://github.com/discord-tickets/bot/compare/v4.0.24...v4.0.25) (2025-01-05)


### Bug Fixes

* invalid role error on ticket creation? ([#572](https://github.com/discord-tickets/bot/issues/572)) ([5ccf58c](https://github.com/discord-tickets/bot/commit/5ccf58cd9896a0309007193b4518fe60ce5529d6))


### Features

* **i18n:** update Dutch translations ([aa8785d](https://github.com/discord-tickets/bot/commit/aa8785d13323a5db5780e84b29c0a8de7355615a))
* **i18n:** update Italian translations ([d07f69d](https://github.com/discord-tickets/bot/commit/d07f69dfac15da689ecd7d5d131cbbd33f2d1fae))
* **i18n:** update Spanish translations ([a2d11a5](https://github.com/discord-tickets/bot/commit/a2d11a5c30384e61fba7b5a29593eb16df2d67ac))



## [4.0.24](https://github.com/discord-tickets/bot/compare/v4.0.23...v4.0.24) (2024-12-20)


### Bug Fixes

* **docker:** use alpine 3.20 instead of 3.21 so prisma can find openssl ([addd5e8](https://github.com/discord-tickets/bot/commit/addd5e896c28597734199947c60b41854deece2d)), closes [/github.com/nodejs/docker-node/issues/2175#issuecomment-2530130523](https://github.com//github.com/nodejs/docker-node/issues/2175/issues/issuecomment-2530130523)



## [4.0.23](https://github.com/discord-tickets/bot/compare/v4.0.22...v4.0.23) (2024-12-20)


### Bug Fixes

* **git:** only ignore top-level directories ([ca38235](https://github.com/discord-tickets/bot/commit/ca38235309c6228f0f2c289c08b4d0dfc18b9e1a))
* **i18n:** `it/commands.slash.claim.name` ([e10d029](https://github.com/discord-tickets/bot/commit/e10d02913a88d5c1332518321303a0356a2046db))


### Features

* guild bans ([30cd541](https://github.com/discord-tickets/bot/commit/30cd5413c4d3154b3421ce92aeaa1cc02974552b))
* **i18n:** update Czech translations ([39de69d](https://github.com/discord-tickets/bot/commit/39de69d81b0755bb6c1302de56127618aeb06de1))
* **i18n:** update Dutch translations ([59bfdf8](https://github.com/discord-tickets/bot/commit/59bfdf882b9035d791097ba3ef6ceabfc64c8024))
* **i18n:** update Italian translations ([3b97696](https://github.com/discord-tickets/bot/commit/3b97696bc585ae79a3a8cacf6a7a381eba6a44b5))
* **i18n:** update Italian translations ([b22a44c](https://github.com/discord-tickets/bot/commit/b22a44ce1edb3f50e5e6110ea170178a8917e600))



## [4.0.22](https://github.com/discord-tickets/bot/compare/v4.0.21...v4.0.22) (2024-11-16)


### Bug Fixes

* **api:** use more appropriate status code ([8818bf6](https://github.com/discord-tickets/bot/commit/8818bf6d48df8a80faae84418cf79dc3903357de))
* **i18n:** `it/commands.slash.add.name` ([ed7a7b7](https://github.com/discord-tickets/bot/commit/ed7a7b78cc46a06d8ce47c94c129640d772ee910))
* **portal:** various improvements and fixes (4205306..b16c92d) ([4688d1b](https://github.com/discord-tickets/bot/commit/4688d1b5cfb6ddb758cea386a9ea167b3eea43ea))
* token samesite=secure ([c6a982e](https://github.com/discord-tickets/bot/commit/c6a982e702e37119071bd6b13e9ddb48f9f16599))


### Features

* **api:** descriptive emoji error message ([3017c0c](https://github.com/discord-tickets/bot/commit/3017c0c458a7b6763a690230f8d29cead21efb3c))
* **api:** generate missing icons ([46bd58d](https://github.com/discord-tickets/bot/commit/46bd58daf626c6df1e5600e017f6df8428026c52))
* **api:** privilege levels ([130f5dc](https://github.com/discord-tickets/bot/commit/130f5dc590f0856982b440f58bcad5161be0699f))
* **api:** redirect on logout ([4d42269](https://github.com/discord-tickets/bot/commit/4d42269a35b485e04a03df85e7c61a7d5e1282ef))
* **api:** something ([b00d2f3](https://github.com/discord-tickets/bot/commit/b00d2f312eb0e3353213a1ebdcf28002342640ec))
* **i18n:** update Italian translations ([22ffd82](https://github.com/discord-tickets/bot/commit/22ffd82a4c08162d7788f346256fb7f44cd481e8))
* **i18n:** update Romanian translations ([6adcf2d](https://github.com/discord-tickets/bot/commit/6adcf2df5ec43ea22aac53d6b68e99e0e78de38d))



## [4.0.21](https://github.com/discord-tickets/bot/compare/v4.0.20...v4.0.21) (2024-11-09)


### Bug Fixes

* `null` incorrectly triggering tags (closes [#484](https://github.com/discord-tickets/bot/issues/484)) ([9f5c30c](https://github.com/discord-tickets/bot/commit/9f5c30c0bfea9a6d7d403654d50cf5543f7f1e58))
* accepting a close request after a restart ([f9a7f0c](https://github.com/discord-tickets/bot/commit/f9a7f0cbd9d5de9a0fb3f50a2887cc3e3d85ac98))
* custom ID overflow with `Create from message` (closes [#494](https://github.com/discord-tickets/bot/issues/494)) ([b0d77c1](https://github.com/discord-tickets/bot/commit/b0d77c1af657c2cda4c9d152ee6409e97e655ccb))
* log ticket closure even when there is no closer ([412c65c](https://github.com/discord-tickets/bot/commit/412c65c0ff63829c760eb874b36905d41f105581))


### Features

* **i18n:** update German translations ([80b863e](https://github.com/discord-tickets/bot/commit/80b863eec3fadd372128c20c8cb8baeaebe6cc74))
* **i18n:** update Hungarian translations ([aafd960](https://github.com/discord-tickets/bot/commit/aafd96055b9c2564a3be68fa21adfd9c6cd81a8c))
* **i18n:** update Hungarian translations ([a254774](https://github.com/discord-tickets/bot/commit/a25477495931c0742ffdb8a3c15eccef274f2ae0))
* **i18n:** update Hungarian translations ([9efdd25](https://github.com/discord-tickets/bot/commit/9efdd25f81d6f8dbfbd3542e6f594f1e7ee185b8))
* **i18n:** update Romanian translations ([519f9f4](https://github.com/discord-tickets/bot/commit/519f9f4e6d3528e9091976c4645eddaec4f3b7f0))
* transcript button in log channel ([2a96858](https://github.com/discord-tickets/bot/commit/2a96858782f0d9b5404e237aabffb3be877497cc))



## [4.0.20](https://github.com/discord-tickets/bot/compare/v4.0.19...v4.0.20) (2024-09-06)


### Bug Fixes

* downgrade discord.js to resolve Discord API breaking change ([cae54b9](https://github.com/discord-tickets/bot/commit/cae54b97c9d2f03e6e163397564e920086ff299b))
* **security:** transcript access control (closes [#555](https://github.com/discord-tickets/bot/issues/555)) ([b8b5ac9](https://github.com/discord-tickets/bot/commit/b8b5ac946a11a9fc0e34ae1f7050d5235e559608))


### Features

* **i18n:** add Bulgarian translations ([952c154](https://github.com/discord-tickets/bot/commit/952c1541587d9490d1367a4806c1e07b6ffdf9b1))
* **i18n:** update Czech translations ([28764fd](https://github.com/discord-tickets/bot/commit/28764fde8c157de65e0d44823337753f1f9b8ec2))
* **i18n:** update Czech translations ([1c1c993](https://github.com/discord-tickets/bot/commit/1c1c993d20458fc291c38e6e72f8e7dfbe13a631))
* **i18n:** update Czech translations ([b76df6b](https://github.com/discord-tickets/bot/commit/b76df6b47ce19c9a0bcc507cb830fc78b06caac5))
* **i18n:** update Czech translations ([60d48f9](https://github.com/discord-tickets/bot/commit/60d48f93a86b293f654ad027ceb369be048078b9))
* **i18n:** update Czech translations ([619c7a4](https://github.com/discord-tickets/bot/commit/619c7a45e6e5cd322e203001acfb9adb1d364bb8))
* **i18n:** update Czech translations ([5859073](https://github.com/discord-tickets/bot/commit/5859073b83f94a57e49651196acf05f044d50c67))
* **i18n:** update Czech translations ([a6b5447](https://github.com/discord-tickets/bot/commit/a6b5447740c4f184374fef69a072f36893812694))
* **i18n:** update Dutch translations ([3aee581](https://github.com/discord-tickets/bot/commit/3aee581ebc4239dbe81403b998c495d1922ea7c6))
* **i18n:** update Italian translations ([#547](https://github.com/discord-tickets/bot/issues/547)) ([7fbbe45](https://github.com/discord-tickets/bot/commit/7fbbe450d39e7370539ab1fa1c1f1ca4bc2c240a))
* **i18n:** update Korean translations ([4a0f31e](https://github.com/discord-tickets/bot/commit/4a0f31e295418a8c1bbf234d0c9baeb9a5567bcb))
* **i18n:** update Korean translations ([f9df305](https://github.com/discord-tickets/bot/commit/f9df30569c28397a477dc7110cd4affe5f1df0eb))
* **i18n:** update Korean translations ([afb72ed](https://github.com/discord-tickets/bot/commit/afb72ed280fb82a7b9dec2945108dee775e1d15c))
* **i18n:** update Korean translations ([d6ed6ab](https://github.com/discord-tickets/bot/commit/d6ed6ab44a299e6eb3547da9614dfa55cd0aa751))
* **i18n:** update Korean translations ([1bd5ea3](https://github.com/discord-tickets/bot/commit/1bd5ea32a7d18c062401421a929499f498956e00))
* **i18n:** update Russian translations ([4aa9a6f](https://github.com/discord-tickets/bot/commit/4aa9a6fefd2b000fd46f57a8c12c05dbf656e04b))
* **i18n:** update translation files ([4db7614](https://github.com/discord-tickets/bot/commit/4db76148ad8348946151f548a10fb6798c2fa349))



## [4.0.19](https://github.com/discord-tickets/bot/compare/v4.0.18...v4.0.19) (2024-05-29)


### Bug Fixes

* **http:** ipv6 support ([e78469e](https://github.com/discord-tickets/bot/commit/e78469e9f66dbaf9d3e4e7ad44e3d4ddcf0dcf03))


### Features

* **i18n:** update Dutch translations ([8bef2eb](https://github.com/discord-tickets/bot/commit/8bef2eb5f86d52f04788402db1df136fd95e803a))
* **i18n:** update Dutch translations ([1d97895](https://github.com/discord-tickets/bot/commit/1d97895058a4823eb05d13dd2bee0079cde9617f))
* **i18n:** update Dutch translations ([7fd9157](https://github.com/discord-tickets/bot/commit/7fd91574ee7f5bab457432159730f24f2a0318ff))
* **i18n:** update German translations ([37b7f6e](https://github.com/discord-tickets/bot/commit/37b7f6eb6b771e436c18398f3b4dc46b66e66633))
* **i18n:** update German translations ([0e65790](https://github.com/discord-tickets/bot/commit/0e6579002f63e37a61e2621f1febcf5c6b341eed))
* **i18n:** update Portuguese (Brazil) translations ([fef853d](https://github.com/discord-tickets/bot/commit/fef853d2ae3c41ada44686a7003d73188ee7fd2d))
* **i18n:** update Portuguese (Brazil) translations ([2383f50](https://github.com/discord-tickets/bot/commit/2383f5074873b773e90e91d5c45844c2d937e7d9))



## [4.0.18](https://github.com/discord-tickets/bot/compare/v4.0.17...v4.0.18) (2024-05-01)


### Features

* internal sharding ([7a131e7](https://github.com/discord-tickets/bot/commit/7a131e79360da3fc7985d27a5c7b515915420675))



## [4.0.17](https://github.com/discord-tickets/bot/compare/v4.0.16...v4.0.17) (2024-04-29)


### Bug Fixes

* **i18n:** update Norwegian translations ([174e4a6](https://github.com/discord-tickets/bot/commit/174e4a6fae583a87f9c1e27b0293d00b61f63e74))


### Features

* **i18n:** add Norwegian ([22e26e1](https://github.com/discord-tickets/bot/commit/22e26e11d96321ca66deaf2d8cc60c2c2b54f75b))
* **i18n:** make turkish language support more comprehensive ([#538](https://github.com/discord-tickets/bot/issues/538)) ([895b629](https://github.com/discord-tickets/bot/commit/895b629da13b471c97cea5af6bcfacba653b522c))
* **i18n:** update Dutch translations ([c2f9dd7](https://github.com/discord-tickets/bot/commit/c2f9dd711018379f43ab4b13b6e649eda586c130))
* **i18n:** update Dutch translations ([c4f8169](https://github.com/discord-tickets/bot/commit/c4f8169a38b79b7e61c813e02ac46be9e9a21fcd))
* **i18n:** update Dutch translations ([3d7bbc8](https://github.com/discord-tickets/bot/commit/3d7bbc8057ff4dfc31d56c8fd1121ab9bd0a58ac))
* **i18n:** update Dutch translations ([b453cf6](https://github.com/discord-tickets/bot/commit/b453cf66e0a8e15b84a47450847be430b6ae60a5))
* **i18n:** update Dutch translations ([88398bf](https://github.com/discord-tickets/bot/commit/88398bf517b4530ec40fb0ee722e21ae1997f149))
* **i18n:** update Dutch translations ([438ac01](https://github.com/discord-tickets/bot/commit/438ac01830ca50868a9003aedc71c06024d66b38))
* **i18n:** update Dutch translations ([e2d3ec9](https://github.com/discord-tickets/bot/commit/e2d3ec987b3cdbaac76b5486a65cb363ab978d1b))
* **i18n:** update Dutch translations ([711a472](https://github.com/discord-tickets/bot/commit/711a47250eceafba76d82463bab134ba9787ea0f))
* **i18n:** update Dutch translations ([f1feb06](https://github.com/discord-tickets/bot/commit/f1feb061ecb77e7bb02f86b1aa2be83515327a81))
* **i18n:** update Dutch translations ([092c6bf](https://github.com/discord-tickets/bot/commit/092c6bff989cd3bbc54cb81fe64a76874066ee9c))
* **i18n:** update Norwegian Bokmål translations ([5aa682f](https://github.com/discord-tickets/bot/commit/5aa682f0ec50356799e41714a1d1ebf69e0f212e))
* **i18n:** update Portuguese (Brazil) translations ([3403014](https://github.com/discord-tickets/bot/commit/340301481290875798661c174b2dd90cecb551c1))
* **i18n:** update Spanish translations ([4790949](https://github.com/discord-tickets/bot/commit/4790949fb4bf55e282989471e1c46b2510eff3f7))
* **i18n:** update translation files ([66cb831](https://github.com/discord-tickets/bot/commit/66cb83123703bb370b018d1bd1cb746cfc9311b7))



## [4.0.16](https://github.com/discord-tickets/bot/compare/v4.0.15...v4.0.16) (2024-03-07)


### Features

* **i18n:** update French translations ([c408d6b](https://github.com/discord-tickets/bot/commit/c408d6bf5724c44a08aeb6398a96024ad73caf81))
* **i18n:** update French translations ([0989c46](https://github.com/discord-tickets/bot/commit/0989c468aa8a3958c0244943cd1c84431208c846))
* **i18n:** update Swedish translations ([ae9afdc](https://github.com/discord-tickets/bot/commit/ae9afdccf838b71110466b4cb270fe2dc6827308))
* **i18n:** update Swedish translations ([2a43aad](https://github.com/discord-tickets/bot/commit/2a43aadca1dfcb1c4d0dbf66d262a04338742a01))
* **i18n:** update Swedish translations ([95b713b](https://github.com/discord-tickets/bot/commit/95b713b689fdb4dc79560d5838f5496fed64f2d7))



## [4.0.15](https://github.com/discord-tickets/bot/compare/v4.0.14...v4.0.15) (2024-03-03)


### Bug Fixes

* catch missing role errors (closes [#518](https://github.com/discord-tickets/bot/issues/518)) ([c09972f](https://github.com/discord-tickets/bot/commit/c09972f3cf65eeb755cf00537bcd6bcd05e4df13))
* preview rendering error with missing roles ([04f0b0d](https://github.com/discord-tickets/bot/commit/04f0b0d0339c0b93c92111de782a819a8316107e))


### Features

* **docker:** mount timezone configs ([74fb398](https://github.com/discord-tickets/bot/commit/74fb398c8f84bdaaa89538b7d0dbf841f997aa84))
* **i18n:** add Danish translations ([b8972ba](https://github.com/discord-tickets/bot/commit/b8972ba825191d375a18c9e3b8f97ecf384fee57))
* **i18n:** add Korean translations ([dd068f5](https://github.com/discord-tickets/bot/commit/dd068f5349a1a2a59e621cd3281d384904c8f669))
* **i18n:** add Traditional Chinese (zh-TW) translations ([#522](https://github.com/discord-tickets/bot/issues/522)) ([1bcfd65](https://github.com/discord-tickets/bot/commit/1bcfd65055859ea7fbb307089cc8f32e2f0c7e6b))
* **i18n:** update Greek translations ([4715fc9](https://github.com/discord-tickets/bot/commit/4715fc94aac44204c5f57dfd0d1e46866611eda2))
* **i18n:** update Korean translations ([215f942](https://github.com/discord-tickets/bot/commit/215f9421b5778ad9889242a2ed53f351803b342b))
* **i18n:** update Korean translations ([e8b9aef](https://github.com/discord-tickets/bot/commit/e8b9aefa4906ee5ca2b89d7930b1c8f80a816567))
* **i18n:** update Korean translations ([b1117d7](https://github.com/discord-tickets/bot/commit/b1117d77dd5e434160ac74de55d35aefe34abe7b))
* **i18n:** update Korean translations ([348565d](https://github.com/discord-tickets/bot/commit/348565d15ed3267d2686b4be819e82263343ea46))
* **i18n:** update Polish translations ([963e15b](https://github.com/discord-tickets/bot/commit/963e15b783b2bbc5f83e2f0b5a1b61f18d1f2494))
* **i18n:** update Portuguese (Brazil) translations ([d7c1eac](https://github.com/discord-tickets/bot/commit/d7c1eac8b476ce98ceab2cee51a7341947397742))
* **i18n:** update Swedish translations ([e9295ba](https://github.com/discord-tickets/bot/commit/e9295bab86903b93309a43e8d1e7254e3cd00bb9))
* **i18n:** update translation files ([984973e](https://github.com/discord-tickets/bot/commit/984973e0fc72e83f7cf131c72f242a9f4d170562))



## [4.0.14](https://github.com/discord-tickets/bot/compare/v4.0.13...v4.0.14) (2024-01-21)


### Bug Fixes

* `.gitignore` ([38ae314](https://github.com/discord-tickets/bot/commit/38ae3149e74b8bf2e6e9b974daa9f554adf7a406))
* `postinstall` search path ([18e63bf](https://github.com/discord-tickets/bot/commit/18e63bf2dc62357bc6efcccddf35148f306369fa))
* actually revoke the token ([3e7127a](https://github.com/discord-tickets/bot/commit/3e7127a3d9e4061fffac1ae47f01369069365d99))
* create guild settings to allow commands before configuration ([00f16be](https://github.com/discord-tickets/bot/commit/00f16be7903e50b061dd169ff69df30aeb3d7083))
* **docker:** permissions ([3bca48f](https://github.com/discord-tickets/bot/commit/3bca48f159d1da64ac9a586a0c786172e05a09b3))
* **docker:** permissions ([036cbaf](https://github.com/discord-tickets/bot/commit/036cbaf47e4a39c6398bbf5516ea7ef7139f596d))
* **docker:** permissions (again) ([a349b0e](https://github.com/discord-tickets/bot/commit/a349b0e0ff2afb688da11ec474b30040432e800c))
* **docker:** start script ([#513](https://github.com/discord-tickets/bot/issues/513)) ([978eb92](https://github.com/discord-tickets/bot/commit/978eb9278168ef91cc4809e52a1deb1979a47001))
* error handling (closes [#506](https://github.com/discord-tickets/bot/issues/506)) ([1b0b0a2](https://github.com/discord-tickets/bot/commit/1b0b0a22f94868fb6d3ca6b48ef1975cdfdd82e2))
* **http:** fastify dependencies (closes [#461](https://github.com/discord-tickets/bot/issues/461), [#491](https://github.com/discord-tickets/bot/issues/491)) ([#520](https://github.com/discord-tickets/bot/issues/520)) ([5f77b28](https://github.com/discord-tickets/bot/commit/5f77b2801292e117e2d8b52fbb6ed51b13be716f))
* lockfile ([69a1eea](https://github.com/discord-tickets/bot/commit/69a1eea7c7681175d24078a6da76d565c7f1f801))
* log banner colours on Pterodactyl ([e6f87a8](https://github.com/discord-tickets/bot/commit/e6f87a8bf587010d6a8de0845f263d541adbdc54))
* only send value if not empty (closes [#458](https://github.com/discord-tickets/bot/issues/458)) ([bcd02b1](https://github.com/discord-tickets/bot/commit/bcd02b1dead34f2c674a2c9f90a8e03aecb9198b))
* remove ghost files ([916f3fe](https://github.com/discord-tickets/bot/commit/916f3fee78e1657ae0e029ea2ae614109ee3bdc2))
* setting min-length in settings panel ([73c30c8](https://github.com/discord-tickets/bot/commit/73c30c84bd7adcde959b73a5bc3fb8cfdb5950e1))
* use more appropriate status code ([036c208](https://github.com/discord-tickets/bot/commit/036c208cf8bf36ac7b0ddfe78750f933e6450a62))


### Features

* add `HTTP_INTERNAL` env variable ([10eef10](https://github.com/discord-tickets/bot/commit/10eef102165f30e98a759b145bf3e88b4d2c0095))
* allow other CWD ([c596e23](https://github.com/discord-tickets/bot/commit/c596e237dee91ab275b1bccab49eaf004f6dd399))
* **docker:** separate installation & working directories ([c4d96e8](https://github.com/discord-tickets/bot/commit/c4d96e8ee2408ec2d395b5f4106f1fa1f682ef73))
* **http:** `prompt=none` (closes [#507](https://github.com/discord-tickets/bot/issues/507)) ([5e5de6b](https://github.com/discord-tickets/bot/commit/5e5de6b4d9b6828a9fc4ff3c7d9ceca911d4dce9))
* **i18n:** update Russian translations ([7318211](https://github.com/discord-tickets/bot/commit/731821135088357c8260946e7f9457a2e1765992))
* **i18n:** update Turkish translations ([0e81c48](https://github.com/discord-tickets/bot/commit/0e81c4833e366f33c0ff6260ba54e27b6a25c816))
* **i18n:** update Turkish translations ([d70c557](https://github.com/discord-tickets/bot/commit/d70c5574f88f55ad323530968bb3e70f175ae14d))
* **i18n:** update Turkish translations ([33145bb](https://github.com/discord-tickets/bot/commit/33145bb8df48bb720149b20703bc9f6b15c28c62))
* **pterodactyl:** improve egg ([e8456c0](https://github.com/discord-tickets/bot/commit/e8456c09f1f4f3ecfc156dacbdce5ce33f2762ff))
* **ptreodactyl:** new egg ([#515](https://github.com/discord-tickets/bot/issues/515)) ([db4fd84](https://github.com/discord-tickets/bot/commit/db4fd843f46213b3e1a468dd050ed411e5bf7833))



## [4.0.13](https://github.com/discord-tickets/bot/compare/v4.0.12...v4.0.13) (2023-12-24)


### Bug Fixes

* `npx` stdin command's child process stderr logging ([296002e](https://github.com/discord-tickets/bot/commit/296002e04f545189912b05ef92dae68085fef33e))
* allow no activities ([bd15bd8](https://github.com/discord-tickets/bot/commit/bd15bd8145f4f9fe9b35e4069feafe04777a7d67))


### Features

* **i18n:** add Thai translations ([e2a88f8](https://github.com/discord-tickets/bot/commit/e2a88f82e7189814b15edf3834e153d8dfed6ae4))
* **i18n:** update Finnish translations ([f5b2fc7](https://github.com/discord-tickets/bot/commit/f5b2fc795b37dd81bfdf11f4a848f3666b687e06))
* **i18n:** update Hungarian translations ([717ed0f](https://github.com/discord-tickets/bot/commit/717ed0f4052e1b8c2768e32e33301b0461ed4fd8))
* **i18n:** update Italian translations ([c021f8a](https://github.com/discord-tickets/bot/commit/c021f8a42345de34fc7f64c8a9599778cdf0b721))
* **i18n:** update Italian translations ([cbc62dc](https://github.com/discord-tickets/bot/commit/cbc62dcb046ea96e251c17207cdb5fcd06199b0a))
* **i18n:** update Italian translations ([26e3ac2](https://github.com/discord-tickets/bot/commit/26e3ac26cec2b320fe17a06bfb3c5e6c4b5082e2))
* **i18n:** update Thai translations ([106473b](https://github.com/discord-tickets/bot/commit/106473b26ab137346b3c587e51725ae122ed3bf7))
* **i18n:** update Thai translations ([e30fb14](https://github.com/discord-tickets/bot/commit/e30fb146d7a88e0ba28e02c3a8f55a56e918835a))
* **i18n:** update Thai translations ([081d7a8](https://github.com/discord-tickets/bot/commit/081d7a8cebffade6f849d104d00ea4f85421de71))
* **i18n:** update Thai translations ([fcd174d](https://github.com/discord-tickets/bot/commit/fcd174d827b1df1b42337a3757fa8c89e857743c))



## [4.0.12](https://github.com/discord-tickets/bot/compare/v4.0.11...v4.0.12) (2023-11-18)


### Bug Fixes

* activity name update ([#503](https://github.com/discord-tickets/bot/issues/503)) ([12c4c96](https://github.com/discord-tickets/bot/commit/12c4c96c1fe7c56990fd385fc9e26217ea9ff467))



## [4.0.11](https://github.com/discord-tickets/bot/compare/v4.0.10...v4.0.11) (2023-11-16)


### Bug Fixes

* **i18n:** update Portuguese (Brazil) translations ([#497](https://github.com/discord-tickets/bot/issues/497)) ([efc7885](https://github.com/discord-tickets/bot/commit/efc7885367552955cd1857eb94b0940a56505ec6))
* open tickets count ([#500](https://github.com/discord-tickets/bot/issues/500)) ([b329d5a](https://github.com/discord-tickets/bot/commit/b329d5ae2e0e64b0752d0f452170f4d58accc735))


### Features

* add ticket/channel ID on closed tickets list ([#496](https://github.com/discord-tickets/bot/issues/496)) ([cab1b3b](https://github.com/discord-tickets/bot/commit/cab1b3b6ca067578dabf05a2075697361e7d031b))
* **i18n:** add Romanian translations ([f87d880](https://github.com/discord-tickets/bot/commit/f87d88075395fc13841329ca4c9ed29ac157371d))
* **i18n:** update Czech translations ([a707869](https://github.com/discord-tickets/bot/commit/a7078697b61722aec5bc7ecbb437dab31bb50465))
* **i18n:** update Czech translations ([80bedbc](https://github.com/discord-tickets/bot/commit/80bedbc2ba1204376a93260b25c8bbb6a1dbdac1))
* **i18n:** update Dutch translations ([6b8cd9e](https://github.com/discord-tickets/bot/commit/6b8cd9eb290ea2a97927d4bf57541d4e8221d022))
* **i18n:** update Dutch translations ([1e834fd](https://github.com/discord-tickets/bot/commit/1e834fdeb3f726d59aef06a8f42ab1de5e4a9b04))
* **i18n:** update Dutch translations ([4c8bba3](https://github.com/discord-tickets/bot/commit/4c8bba3917c8ce6e1c088487d15f858c1a58ff31))
* **i18n:** update Finnish translations ([e7a1aac](https://github.com/discord-tickets/bot/commit/e7a1aac42411c85186b5f4af3b4590c53f2dfdba))
* **i18n:** update Russian translations ([380d315](https://github.com/discord-tickets/bot/commit/380d315a91718e20eb6b47ea64e6f23f5c7c0677))
* **i18n:** update Spanish translations ([1f7899b](https://github.com/discord-tickets/bot/commit/1f7899b7723555736c697b1a790ddfb8f877eae0))
* **i18n:** update Turkish translations ([99904c2](https://github.com/discord-tickets/bot/commit/99904c2f7af2a9eda164b16ec1e92d3a02a3d461))
* **i18n:** update Turkish translations ([830b1b1](https://github.com/discord-tickets/bot/commit/830b1b1edc03aadf4c8a284615ac80f8b0c42e81))



## [4.0.10](https://github.com/discord-tickets/bot/compare/v4.0.9...v4.0.10) (2023-09-07)


### Features

* **i18n:** translate to Brazilian Portuguese ([#477](https://github.com/discord-tickets/bot/issues/477)) ([febe356](https://github.com/discord-tickets/bot/commit/febe3560555367293d14c8a53e67d032f5b873dd))
* **i18n:** update Portuguese (Brazil) translations [skip ci] ([d6009a9](https://github.com/discord-tickets/bot/commit/d6009a99ad77dc22183bb21bb0412c5ee804811e))
* **i18n:** update Portuguese (Brazil) translations [skip ci] ([#479](https://github.com/discord-tickets/bot/issues/479)) ([1ebe0c6](https://github.com/discord-tickets/bot/commit/1ebe0c61dc8087f4a6d2868cd252a013e5da516a))
* **i18n:** update Spanish translations [skip ci] ([ea16eb7](https://github.com/discord-tickets/bot/commit/ea16eb704bac9d50b5f1260622e502c94ea0145e))



## [4.0.9](https://github.com/discord-tickets/bot/compare/v4.0.8...v4.0.9) (2023-08-25)


### Bug Fixes

* `npx` workaround for PebbleHost ([4a2f85e](https://github.com/discord-tickets/bot/commit/4a2f85e9eb4361a0188a70f8ff3155d8d1e02826))
* **🚨 security:** anyone with the channel ID could read transcripts ([b2790fc](https://github.com/discord-tickets/bot/commit/b2790fca40e55b88e768ae608c01c8d66d77beea))
* edit channel name when transferring (closes [#470](https://github.com/discord-tickets/bot/issues/470)) ([77e5b45](https://github.com/discord-tickets/bot/commit/77e5b45aa8938039374a436c2886a8927d5c9cda))
* **i18n:** space in command name ([2abd9cc](https://github.com/discord-tickets/bot/commit/2abd9cc0086b04ccba7185bf6ca43676fbbe91b1))
* stale notification pinging staff instead of creator (closes [#459](https://github.com/discord-tickets/bot/issues/459)) ([59a6358](https://github.com/discord-tickets/bot/commit/59a6358b37d7b790cca1daee94fdcdf2a1987865))
* update counters when transferring (closes [#468](https://github.com/discord-tickets/bot/issues/468)) ([d1e30ce](https://github.com/discord-tickets/bot/commit/d1e30ce069c4999a82b2381df39fc3d613cd06de))


### Features

* **i18n:** update Dutch translations [skip ci] ([e22f9bc](https://github.com/discord-tickets/bot/commit/e22f9bcf625484f9504a6f85d2593dd1cd57371f))
* **i18n:** update Polish translations [skip ci] ([fb7a11f](https://github.com/discord-tickets/bot/commit/fb7a11fc78c3f48e01ad2671d9efa59e00f17748))



## [4.0.8](https://github.com/discord-tickets/bot/compare/v4.0.7...v4.0.8) (2023-07-30)


### Bug Fixes

* 🤦‍♂️ inflated ticket count and negative response times in stats ([32697c6](https://github.com/discord-tickets/bot/commit/32697c6d13fcd46eb755f83b9ce2e9e972a655ab))
* **🚨 security:** being able to close tickets from other servers (closes [#466](https://github.com/discord-tickets/bot/issues/466)) ([8a8bc2b](https://github.com/discord-tickets/bot/commit/8a8bc2bebe094e7b8eb8b2311fadcac984f60969))
* **i18n:** lowercase names [skip ci] ([0597997](https://github.com/discord-tickets/bot/commit/05979972fe7002a6a2ca527f0887ca2d62671e48))
* keep priority when moving (closes [#467](https://github.com/discord-tickets/bot/issues/467)) ([34b5090](https://github.com/discord-tickets/bot/commit/34b509057519293d188043502b922d583fb7505d))


### Features

* **i18n:** add Polish translations [skip ci] ([e4fff0c](https://github.com/discord-tickets/bot/commit/e4fff0cba5168425e1264b3e2ffd79a6489faa80))
* **i18n:** update Czech translations [skip ci] ([d32b08c](https://github.com/discord-tickets/bot/commit/d32b08c184c934f2ca0dea26b7b7050bbff163fe))
* **i18n:** update Polish translations [skip ci] ([a1be71c](https://github.com/discord-tickets/bot/commit/a1be71c5d7002da5d5e3a6fba45906dd73256b3a))
* **i18n:** update Polish translations [skip ci] ([c23530f](https://github.com/discord-tickets/bot/commit/c23530f962b20d637d5ca27781eee5df2fd89ad5))
* **i18n:** update Polish translations [skip ci] ([09ff025](https://github.com/discord-tickets/bot/commit/09ff025bf3522f531f10bebc143eb7ba8d71c01a))
* **i18n:** update Spanish translations [skip ci] ([e91d1cc](https://github.com/discord-tickets/bot/commit/e91d1ccb2af596de5af54995e2ae2e333a0eebf9))



## [4.0.7](https://github.com/discord-tickets/bot/compare/v4.0.6...v4.0.7) (2023-07-13)


### Bug Fixes

* **i18n:** lowercase names [skip ci] ([b782326](https://github.com/discord-tickets/bot/commit/b7823266ffdc6a13edc7b9f814b55f755369f9c8))
* **i18n:** shorten Hungarian command name ([65ce04d](https://github.com/discord-tickets/bot/commit/65ce04def227fff11db0c4ec9ee83c3cec0997a7))


### Features

* **i18n:** update Hungarian translations [skip ci] ([560ab78](https://github.com/discord-tickets/bot/commit/560ab786bbe05614d8c53dba6889856aa4a2b6e8))
* **i18n:** update Spanish translations [skip ci] ([bd063c4](https://github.com/discord-tickets/bot/commit/bd063c465523e36098afe1d0fdcbf72691774812))
* **i18n:** update Spanish translations [skip ci] ([60e7447](https://github.com/discord-tickets/bot/commit/60e744731928fa2795f6a24650d36dcdd5fb247d))
* **i18n:** update Spanish translations [skip ci] ([ffc44bf](https://github.com/discord-tickets/bot/commit/ffc44bf7ce1ba5d78e188d5844c4138f3cded813))
* **i18n:** update Spanish translations [skip ci] ([0270402](https://github.com/discord-tickets/bot/commit/0270402bd9a7c15521919721fa9d58a55662ca95))
* stats houston v4 ([4b4dcd2](https://github.com/discord-tickets/bot/commit/4b4dcd236eece95dd420700d3afcf917dbc68d49))



## [4.0.6](https://github.com/discord-tickets/bot/compare/v4.0.5...v4.0.6) (2023-07-02)


### Bug Fixes

* disable presence check on public bots ([ca09070](https://github.com/discord-tickets/bot/commit/ca09070c6681cc8815572d5b0c127ac34817ecb7))
* disable presence intent on public bots ([c7d9bbf](https://github.com/discord-tickets/bot/commit/c7d9bbff53ce1e3e5151f0732653ab5e671a3743))
* use new changelog URL ([e8bf45a](https://github.com/discord-tickets/bot/commit/e8bf45a9a44ffe2f928bccbfe8189736072913fa))



## [4.0.5](https://github.com/discord-tickets/bot/compare/v4.0.4...v4.0.5) (2023-06-25)


### Bug Fixes

* editing question answers in a category with `customTopic` set ([47fc7bd](https://github.com/discord-tickets/bot/commit/47fc7bde4333c7e5533e7b4d4015d1a89a199d07))
* encrypt topic ([502f488](https://github.com/discord-tickets/bot/commit/502f48866ade95721400393ca15c196ac8428ca5))
* send image in embed (closes [#441](https://github.com/discord-tickets/bot/issues/441)) ([48902f8](https://github.com/discord-tickets/bot/commit/48902f8131b01d84cff1cf9ead77aae8b5611288))


### Features

* add prisma logging ([3b5e58c](https://github.com/discord-tickets/bot/commit/3b5e58c1fed1fd8aa18c4dd461572cbdf682c195))
* improve error handling ([e8b95a2](https://github.com/discord-tickets/bot/commit/e8b95a2f3149fab08ed3c927f771d8ee4fad9d04))
* new `suid-time` stdin command ([ff8e666](https://github.com/discord-tickets/bot/commit/ff8e66638a56f437ed31032d799498483d185543))


### Performance Improvements

* **sqlite:** run `optimize` every 6h ([8971c0a](https://github.com/discord-tickets/bot/commit/8971c0ad13c287eb21c7a63341dd5c48c1b6ed06))



## [4.0.4](https://github.com/discord-tickets/bot/compare/v4.0.3...v4.0.4) (2023-06-19)


### Bug Fixes

* auto closing tickets ([24360e4](https://github.com/discord-tickets/bot/commit/24360e4dcd362c525344cbb6ce2910be2b2b5ed2))
* **docker:** && I am dumb ([42af824](https://github.com/discord-tickets/bot/commit/42af8241f94b112ebbdb99984476222ee8d64362))
* **docker:** change file ownership ([516c45f](https://github.com/discord-tickets/bot/commit/516c45f9abc531ce15123f77d479eac026a96211))
* **docker:** install `curl` for healthcheck ([11ec0ff](https://github.com/discord-tickets/bot/commit/11ec0ff7e62252c46071aa80a007a94c16cf6061))
* **docker:** maybe there was a reason for that extra line ([ed0457a](https://github.com/discord-tickets/bot/commit/ed0457a0e9a718a0608a1f59adc5c4276046c93f))
* **docker:** update compose file with new path [skip ci] ([d77d37c](https://github.com/discord-tickets/bot/commit/d77d37cf9e234e826178f34ebb50681b4e8bf899))
* **i18n:** rename `es` to `es-ES` ([fa8d159](https://github.com/discord-tickets/bot/commit/fa8d159435ea04204ab923e07ee5f804a215bdb8))
* remove unnecessary code for updating questions ([6e5ccd1](https://github.com/discord-tickets/bot/commit/6e5ccd118def5e1efd76cc3cf70fb62f11119408))
* update notification ([2cfcdba](https://github.com/discord-tickets/bot/commit/2cfcdbaac81a85ff0c8e2588182cd2a26227ed1a))


### Features

* **docker:** add non-root user, labels, and healthcheck (closes [#433](https://github.com/discord-tickets/bot/issues/433)) ([bd42781](https://github.com/discord-tickets/bot/commit/bd427818789a1a26109d9bb8c03b5ef107feecec))
* **i18n:** add Spanish translations [skip ci] ([faddacc](https://github.com/discord-tickets/bot/commit/faddacc6dfa0e29dd6409c437e19a4fe0807d62e))
* **i18n:** add Spanish translations [skip ci] ([3c57130](https://github.com/discord-tickets/bot/commit/3c571304c3c490fa512aeb7595d87795471311e0))
* **i18n:** remove Spanish translations [skip ci] ([7232e56](https://github.com/discord-tickets/bot/commit/7232e567290ca6894550bc5d364a54a99c392ef2))
* **i18n:** update Russian translations [skip ci] ([f995589](https://github.com/discord-tickets/bot/commit/f9955896273283d4e9c92936661fad9893252ce8))
* **i18n:** update Spanish translations [skip ci] ([0bbed13](https://github.com/discord-tickets/bot/commit/0bbed13560705990947666f5267a5dc5b397e4a3))


### Performance Improvements

* **docker:** add `.git` to `.dockerignore` ([4de509c](https://github.com/discord-tickets/bot/commit/4de509cd1b9d7765360a90d9786211615fad007c))
* **sqlite:** synchronous=normal  ([5895b3d](https://github.com/discord-tickets/bot/commit/5895b3dd6e1b953c80d122cd82056272cb316437))


### Reverts

* weblate didn't like that ([d5eff28](https://github.com/discord-tickets/bot/commit/d5eff28b8813cfc5bc7ff356fc4ebe0d000ba11b))



## [4.0.3](https://github.com/discord-tickets/bot/compare/v4.0.2...v4.0.3) (2023-06-05)


### Bug Fixes

* changelog URL ([562e6b8](https://github.com/discord-tickets/bot/commit/562e6b874db3aebfa346aa0eb33ae1c5097a2aa8))


### Features

* **i18n:** update German translations [skip ci] ([b0063e2](https://github.com/discord-tickets/bot/commit/b0063e261989538f48d48dad4cbfb3bc666d8523))
* **i18n:** update German translations [skip ci] ([e32f239](https://github.com/discord-tickets/bot/commit/e32f2399bc2a73b402bb19f714416538811208e8))
* **i18n:** update German translations [skip ci] ([98d7029](https://github.com/discord-tickets/bot/commit/98d7029483fe4bbea6d610f0ec9a83be18885319))
* **i18n:** update German translations [skip ci] ([e68ece2](https://github.com/discord-tickets/bot/commit/e68ece2207526cca44012d2469c7f622744bc321))
* **i18n:** update German translations [skip ci] ([a1f575e](https://github.com/discord-tickets/bot/commit/a1f575ebbd1943a6cfc7c9bd5467af33a93c5727))
* **i18n:** update German translations [skip ci] ([3bfe8b5](https://github.com/discord-tickets/bot/commit/3bfe8b5bbc2165d5b495c233eea82d25722542f5))
* **i18n:** update German translations [skip ci] ([dc60c8b](https://github.com/discord-tickets/bot/commit/dc60c8b3bc7bacd516416fe8c4113c8b8662a348))
* **i18n:** update Russian translations [skip ci] ([a3ae81e](https://github.com/discord-tickets/bot/commit/a3ae81ee77ae175107abcc4a417af844da7b04a4))
* **i18n:** update Russian translations [skip ci] ([f5c7b43](https://github.com/discord-tickets/bot/commit/f5c7b431bad7118da5361b0be9e0060029b809dd))
* **i18n:** update Russian translations [skip ci] ([164ecb5](https://github.com/discord-tickets/bot/commit/164ecb550fa111e407ec317f8031e56d813aec92))
* **i18n:** update Russian translations [skip ci] ([e53013c](https://github.com/discord-tickets/bot/commit/e53013cffb6df3af663d1e873661ddce7867da28))
* **i18n:** update Russian translations [skip ci] ([1a44797](https://github.com/discord-tickets/bot/commit/1a447972e56d36af9876474d0c6f7fa1529a29d2))
* **i18n:** update Russian translations [skip ci] ([604abe6](https://github.com/discord-tickets/bot/commit/604abe67b8367559998dd72783728f945b29f127))
* **i18n:** update Russian translations [skip ci] ([a5e7105](https://github.com/discord-tickets/bot/commit/a5e7105a5fbdfa72c12b311bc7838ab8be331863))



## [4.0.2](https://github.com/discord-tickets/bot/compare/v4.0.1...v4.0.2) (2023-05-31)


### Bug Fixes

* remove unintentional `console.log()` ([797f851](https://github.com/discord-tickets/bot/commit/797f85153c16dab5c45a6b15af80291a89ac9792))



## [4.0.1](https://github.com/discord-tickets/bot/compare/v4.0.0...v4.0.1) (2023-05-31)


### Bug Fixes

* creating the first ticket in a new guild ([eccca34](https://github.com/discord-tickets/bot/commit/eccca3409c61b7aecad7e4e4dfc8cc693091f51f))
* creating the first ticket in a new guild (closes [#428](https://github.com/discord-tickets/bot/issues/428)) ([fbc08c6](https://github.com/discord-tickets/bot/commit/fbc08c6cd07be366017a9295d8e5ca5afd848180))
* **docker:** quote booleans in `docker-compose.yml` ([6bbedee](https://github.com/discord-tickets/bot/commit/6bbedee9f61c81420e3856bcc986ea35ff1c85b9))


### Features

* strip trailing slash rather than complaining about it ([be6a045](https://github.com/discord-tickets/bot/commit/be6a0459a6df8827fe37167ce11bd506ec79c95b))



# [4.0.0](https://github.com/discord-tickets/bot/compare/v3.1.3...v4.0.0) (2023-05-30)


### Bug Fixes

* `/topic` command when there was previously no topic ([34c3ed1](https://github.com/discord-tickets/bot/commit/34c3ed1b6a034145b4336000cba5ca4b545c4d66))
* `Infinity` stats ([f07e157](https://github.com/discord-tickets/bot/commit/f07e1576429f5ebc2b432eae86cd70e22b1937a4))
* `NaN` stats ([5b4f69e](https://github.com/discord-tickets/bot/commit/5b4f69ec9eead5745e8e338e56d5f4b427c9c55d))
* allow staff to get transcripts of other members (closes [#400](https://github.com/discord-tickets/bot/issues/400)) ([a445399](https://github.com/discord-tickets/bot/commit/a44539914eac9bb9196115d1361b6b85433daa22))
* API not working on Windows ([f74069d](https://github.com/discord-tickets/bot/commit/f74069deb6b3078301c425959b989ae1f49a53d0))
* **api:** logout ([#415](https://github.com/discord-tickets/bot/issues/415)) ([d577b9d](https://github.com/discord-tickets/bot/commit/d577b9d057927e1062b5b00d886351537c236385))
* **archives:** add missing null topic message ([353b232](https://github.com/discord-tickets/bot/commit/353b232dcde2d6fa25290d966d2654ba751e8bb4))
* **archives:** role and member bug ([3088303](https://github.com/discord-tickets/bot/commit/30883032b776cfd8d9df460d1b75729e22589b6d))
* cache commands at startup ([2632945](https://github.com/discord-tickets/bot/commit/26329453edded63b92690a5c10e573bf241559e6))
* catch errors ([25d7cda](https://github.com/discord-tickets/bot/commit/25d7cdaee8c1a3dda4d5ef532fcd76723152faaf))
* **channels:** close ticket when the channel is deleted ([0ddd7c4](https://github.com/discord-tickets/bot/commit/0ddd7c416615fe4cbc06d289ea1e5eb823b8e4b7)), closes [#276](https://github.com/discord-tickets/bot/issues/276)
* check roles for staff-only commands ([daadb5f](https://github.com/discord-tickets/bot/commit/daadb5fe85d32cd86f46fd915073ba75138c9401))
* closing ticket with missing creator (closes [#401](https://github.com/discord-tickets/bot/issues/401)) ([d126736](https://github.com/discord-tickets/bot/commit/d1267360c84dc40d39b5311900987ecaf4ec7148))
* convert pinned messages `Map Iterator` to array ([0d1cb90](https://github.com/discord-tickets/bot/commit/0d1cb90e7ea36685015712011835f45745c80613))
* decrypt referenced ticket's topic ([5982754](https://github.com/discord-tickets/bot/commit/5982754813e8e42a9914f06684667020842be75d))
* default to `production` ([f97a7ab](https://github.com/discord-tickets/bot/commit/f97a7ab61c68d39b3deb8155cd46a04f2e862703))
* delete tickets when their category is deleted (closes [#384](https://github.com/discord-tickets/bot/issues/384)) ([bd1bc19](https://github.com/discord-tickets/bot/commit/bd1bc195489cdcccb73c7fe61741fe603d0b6b67))
* **docker:** add `tty` and `stdin_open` ([6844828](https://github.com/discord-tickets/bot/commit/6844828d33273a091754e7f32518c2e8500ea505))
* Dockerfile ([#394](https://github.com/discord-tickets/bot/issues/394)) ([d09598d](https://github.com/discord-tickets/bot/commit/d09598dd3f52d6290f84ea1cf6ded9ca105035c3))
* **docker:** rename ([ec85893](https://github.com/discord-tickets/bot/commit/ec8589393b0b2c0ba741286e058fb238b1c7235a))
* **docker:** update docker files ([4e21382](https://github.com/discord-tickets/bot/commit/4e21382e1ecee04cf36e355e57a1cc51405889cf))
* **docker:** use the same port ([db26553](https://github.com/discord-tickets/bot/commit/db265537241c659a88f0e5a8745f6c5e4455a0e7))
* don't allow removing the creator ([457ede3](https://github.com/discord-tickets/bot/commit/457ede3ac75ebf0b02b788fdd2a5fa7a3bae1bda))
* don't fetch partial messages on delete ([0fa45e3](https://github.com/discord-tickets/bot/commit/0fa45e3e50d0ec4d3caf20f09307d0a97e922dd1))
* don't give useless `#unknown-channel` in ticket close logs ([d7ae5c0](https://github.com/discord-tickets/bot/commit/d7ae5c0c9e7d01e27ec298ef4ba79b7e4f83173b))
* don't throw errors on every message if a guild isn't configured ([62ab9eb](https://github.com/discord-tickets/bot/commit/62ab9eb6c731edd8b3374c6a973a4ba2a429902d))
* duplicated ticket numbers (fixes [#418](https://github.com/discord-tickets/bot/issues/418)) ([fa921fa](https://github.com/discord-tickets/bot/commit/fa921fa5a6be16eaae0b7c9f11c9714d4ad3a51e))
* guild selector not filtering guilds (closes [#408](https://github.com/discord-tickets/bot/issues/408)) ([739efdc](https://github.com/discord-tickets/bot/commit/739efdcc3aa7f052d518fdb768fa4ea4c7b5921b))
* HTTP log colours ([cdfdf72](https://github.com/discord-tickets/bot/commit/cdfdf7202660f7325e0b831a20f2abd7c43f0e26))
* http log spam ([788f0fe](https://github.com/discord-tickets/bot/commit/788f0fee05052bd8205b22d8ba2fc651b1effbf4))
* http, improve env ([5a2106c](https://github.com/discord-tickets/bot/commit/5a2106caa47c04d99169dd21d7750ed15777bb30))
* **i18n:** broken translations ([b8c2a7c](https://github.com/discord-tickets/bot/commit/b8c2a7cc1331f9707f75fe67167549fe928fe21b))
* **i18n:** lowercase command name (fr) ([b6d0c0e](https://github.com/discord-tickets/bot/commit/b6d0c0e1df8c21dea1d9326c23e4b476392ed9bf))
* **i18n:** remove disallowed `/claim` command name ([68e3ba6](https://github.com/discord-tickets/bot/commit/68e3ba69a9f20d9a1ba70bfd204afebb3ac58481))
* image name in docker-compose.yml ([ff626d2](https://github.com/discord-tickets/bot/commit/ff626d2871620dc6ace99608d506f923344cbaf0))
* inactivity warning spam ([f69bc9a](https://github.com/discord-tickets/bot/commit/f69bc9a185bd4b7a73ecb827a41dd3c704a485b8))
* infinite feedback loop (closes [#407](https://github.com/discord-tickets/bot/issues/407)) ([f1029b8](https://github.com/discord-tickets/bot/commit/f1029b8320762e483e253f97ae00dce83d60d687))
* infinite redirect when logging in ([757f77f](https://github.com/discord-tickets/bot/commit/757f77fb1d7b6e6285e8e527b8f114de20f12b58)), closes [696204#c41](https://github.com/696204/issues/c41)
* lint command ([b8dd190](https://github.com/discord-tickets/bot/commit/b8dd1900e950ccd140c8d9a32c235c6025d52fe0))
* listen on `0.0.0.0` ([9e4f532](https://github.com/discord-tickets/bot/commit/9e4f532ae870986287bcd3fbd7f1692cf51eeeff))
* lockfile ([810439e](https://github.com/discord-tickets/bot/commit/810439e1e476ce65127921de34caaf858cd345b7))
* **logging:** don't log useless `messageDelete` events ([6b066c1](https://github.com/discord-tickets/bot/commit/6b066c177aa6e3dd61793fcbfc2cae33be629bbd))
* **logging:** don't send empty changelogs ([7812e62](https://github.com/discord-tickets/bot/commit/7812e627768b3eb80145b915c4498759f41b2c80))
* **logging:** don't send empty changelogs ([7864c8d](https://github.com/discord-tickets/bot/commit/7864c8d544169c30338f66013616ff09d9bbd3a9))
* **logging:** ignore ephemeral message updates ([0436952](https://github.com/discord-tickets/bot/commit/04369523279e8c8e2b2e02f3c12d23971584b327))
* make `/move` edit the channel name and permission overwrites ([a953308](https://github.com/discord-tickets/bot/commit/a95330853203b1b035bd9cb66aaa48b3efa11b9f))
* make script executable ([642060c](https://github.com/discord-tickets/bot/commit/642060cfb69aa0b9e1d545bc3b3290f2cbb5065a))
* message logging ([a60c998](https://github.com/discord-tickets/bot/commit/a60c998605010b934e0bc435086b4414d1c3a4bb))
* new line replacement ([cf6b347](https://github.com/discord-tickets/bot/commit/cf6b34785cbeb2135037f25d208e50533db8d9e2))
* only allow `/topic` in tickets ([9a91633](https://github.com/discord-tickets/bot/commit/9a916339efb847b6940e382ee6eebca56a8e1153))
* remove footer from close request embed ([c362030](https://github.com/discord-tickets/bot/commit/c3620309bd4907d35906f75c8ed294405be67fc5))
* response & resolution time stats ([ced14ce](https://github.com/discord-tickets/bot/commit/ced14ce36a37a7ecb9fd66e93650f3579955516a))
* revoke token on logout ([f55ee02](https://github.com/discord-tickets/bot/commit/f55ee02ce51e84f45d6100194665a360a3038349))
* **schema:** feedback cascading deletion ([7e4039d](https://github.com/discord-tickets/bot/commit/7e4039dcce41a9705ca84f184adc14768568bbd8))
* set tickets as closed (fixes [#382](https://github.com/discord-tickets/bot/issues/382)) ([630d3ff](https://github.com/discord-tickets/bot/commit/630d3ff4bbac7fb58a18e1f6997ed0fed1b54580))
* settings ([12c741b](https://github.com/discord-tickets/bot/commit/12c741b2558570ccb4fbc883839c9e56ef873468))
* settings app ([be7f431](https://github.com/discord-tickets/bot/commit/be7f43174662a33d3ff2c3ae3cf1ed032062f56f))
* start script ([9936b05](https://github.com/discord-tickets/bot/commit/9936b05fbb5f93e40ddbbd4a32037434f3b721fe))
* **stats:** average response/resolution times ([cf93f08](https://github.com/discord-tickets/bot/commit/cf93f085ac4309ba1da24341b13b4ddbada5b2a4))
* ticket close DM ([6f36ef9](https://github.com/discord-tickets/bot/commit/6f36ef9204879538d479d4225edee4ba38557da6))
* ticket closing ([d1c3620](https://github.com/discord-tickets/bot/commit/d1c3620fcdcc89a408cae12a5b0dbb31909a75d4))
* ticket creation ([a469627](https://github.com/discord-tickets/bot/commit/a4696273ea062833b0cb4c1065febf10f0603352))
* typo ([76ed77f](https://github.com/discord-tickets/bot/commit/76ed77fe0ce5ca0b6877ea858fdecebeb545e32e))
* typo ([1ecb6f5](https://github.com/discord-tickets/bot/commit/1ecb6f5d3263d9656828515422aeb722466d016a))
* uncomment ([b4ab752](https://github.com/discord-tickets/bot/commit/b4ab7524e2710987ab206e67d84c7756e8cb21f5))
* unnecessary message update logs ([119f997](https://github.com/discord-tickets/bot/commit/119f997ffe429f612d1b7afdad96eadff75c1d3a))
* update cache when tags are updated ([9fc1130](https://github.com/discord-tickets/bot/commit/9fc1130c4c6e0ee6c31efaf4e4b2bc3b9a73170b))
* update categories cache when guild settings are changed ([8b692fa](https://github.com/discord-tickets/bot/commit/8b692fa5e218d5bb7fb2a67e70d7aceb63326870))
* update reject button correctly ([42ad521](https://github.com/discord-tickets/bot/commit/42ad5216f6da80fb8b751bc2746eee15d91b87ba))
* update to`discord.js@13.14.0` ([03aeaf4](https://github.com/discord-tickets/bot/commit/03aeaf4083f549c01ed4e63f18bc0bb93dc1ae70))
* use `channel` not `message.channel` ([36b9fd3](https://github.com/discord-tickets/bot/commit/36b9fd3502537f5be0a5b35f5619d38cbe0daedc))
* use environment variables ([bcf474c](https://github.com/discord-tickets/bot/commit/bcf474cc1c8a45f9a83f3a014ef628ed949919a7))
* **working hours:** invalid timestamps with timezones (closes [#417](https://github.com/discord-tickets/bot/issues/417)) ([921bdfa](https://github.com/discord-tickets/bot/commit/921bdfa4476fabc16c3d9f8a9fd935afba566b25))


### Features

* `/add` and `/remove` commands ([15318df](https://github.com/discord-tickets/bot/commit/15318df9e4325c0f89257b44f29f37af499b013a))
* `version` stdin command (closes [#402](https://github.com/discord-tickets/bot/issues/402)) ([1992ff6](https://github.com/discord-tickets/bot/commit/1992ff641cde3e4845540f93a68de45e9f180b3e))
* add `/move` command ([9f18958](https://github.com/discord-tickets/bot/commit/9f18958c7574510ebcb2b4c3283e2d712832967a))
* add `/tickets` command ([c6f1261](https://github.com/discord-tickets/bot/commit/c6f1261478fc29f261fdd0d32a7fb84feea66b76))
* add `/topic` command ([f27feea](https://github.com/discord-tickets/bot/commit/f27feea2f9ddd7e3a2ace10ebcd9e375a5b0eb2c))
* add `/transfer` command ([4b40f2c](https://github.com/discord-tickets/bot/commit/4b40f2cdbd296f2325bdb0b9006a5be9fb4f5fc3))
* add `PUBLISH_COMMANDS` environment variable ([adab383](https://github.com/discord-tickets/bot/commit/adab3831fac1175af12a2b4015d3c115183e3ee5))
* add API service keys ([6773d9d](https://github.com/discord-tickets/bot/commit/6773d9ddbe6cc333686136c949d390162382dec7))
* add Caddyfile ([969e433](https://github.com/discord-tickets/bot/commit/969e433154a25aa74d974a5724c95a6c0f546e19))
* add help hint for invalid stdin commands ([72e264d](https://github.com/discord-tickets/bot/commit/72e264d04c8108cf5fc6cb4911960a4926acd925))
* add target ID ([26ab229](https://github.com/discord-tickets/bot/commit/26ab229c97aace7f37671f98a3209d5e97a81c29))
* add ticket claiming ([77216ba](https://github.com/discord-tickets/bot/commit/77216ba43d6d8565a530d16281e0e199a0da2bf7))
* **api:** show guilds that the bot isn't in ([ea9d3e4](https://github.com/discord-tickets/bot/commit/ea9d3e4e3380ca8bffa1f07ac2b79851af35a23b))
* **archives:** add transcript command ([92d5a7e](https://github.com/discord-tickets/bot/commit/92d5a7ed96c6c56e8e3147a153da89115f1af88b))
* **archives:** update transcript template ([066eb95](https://github.com/discord-tickets/bot/commit/066eb954e309896ccdc63ea5c6a95e15d8e6bc14))
* close tickets on channel delete ([813beb4](https://github.com/discord-tickets/bot/commit/813beb44a0456a0870671fccecb458d6a1cd7560))
* database migrations ([63f5ea6](https://github.com/discord-tickets/bot/commit/63f5ea61f79233e24a2d328c5c4d66f10c853aef))
* DM on close (fixes [#338](https://github.com/discord-tickets/bot/issues/338)) ([5579362](https://github.com/discord-tickets/bot/commit/5579362f262c07d879901d31f1a0ec78fa7c7acd))
* **docker:** Add compose config ([00194a9](https://github.com/discord-tickets/bot/commit/00194a93666463b6e38ed8ddf197dd126c1b03ed))
* **docker:** add docker-compose.yml ([#387](https://github.com/discord-tickets/bot/issues/387)) ([cb4e253](https://github.com/discord-tickets/bot/commit/cb4e253dda202cd3d3c5d475fc55e102e17b2c0c))
* **docker:** add new Dockerfile ([e6bce8b](https://github.com/discord-tickets/bot/commit/e6bce8b331c440f39575dab7d2cab3428ada96a6))
* **docker:** rename build stages ([699b612](https://github.com/discord-tickets/bot/commit/699b612e675b1dfaff2bdd838aa0548d3099bee7))
* feedback, start of close requests ([8bf01aa](https://github.com/discord-tickets/bot/commit/8bf01aa520ac6ce6f82f23a23756e98a004669f7))
* finish `/force-close` command (closes [#311](https://github.com/discord-tickets/bot/issues/311)) ([540ee54](https://github.com/discord-tickets/bot/commit/540ee547eaf52c79fc11b9f024ed330d437fac65))
* finish user `create` command (closes [#291](https://github.com/discord-tickets/bot/issues/291)) ([8f51ff8](https://github.com/discord-tickets/bot/commit/8f51ff885c4000bbcf38c4a09c1d7dfb46792d0b))
* **i18n:** add Dutch translations [skip ci] ([6f97e4a](https://github.com/discord-tickets/bot/commit/6f97e4adc8a7d201ccc9f03eeab5688287217478))
* **i18n:** add Greek translations [skip ci] ([4010b97](https://github.com/discord-tickets/bot/commit/4010b9735cfacc21ea311255ec6bf1cad513cb77))
* **i18n:** update Czech translations [skip ci] ([de825a5](https://github.com/discord-tickets/bot/commit/de825a5d81b86e0f7350047dd61ac883ae534da1))
* **i18n:** update Czech translations [skip ci] ([ad3abe1](https://github.com/discord-tickets/bot/commit/ad3abe109477204b0492e69851d7615c91e56b09))
* **i18n:** update Czech translations [skip ci] ([d6897e2](https://github.com/discord-tickets/bot/commit/d6897e26542d8e751bde407ebe8987c43cad0c45))
* **i18n:** update Czech translations [skip ci] ([8843f30](https://github.com/discord-tickets/bot/commit/8843f306a7e3b1b9c79652cbcdf590a7302e6f7a))
* **i18n:** update Czech translations [skip ci] ([7cc75b8](https://github.com/discord-tickets/bot/commit/7cc75b8f35923f2f18ed19e772eaf3095df95e65))
* **i18n:** update Czech translations [skip ci] ([f87d7e3](https://github.com/discord-tickets/bot/commit/f87d7e38bce2c76cff6f82b745f6b29decc48ef7))
* **i18n:** update Czech translations [skip ci] ([61571f8](https://github.com/discord-tickets/bot/commit/61571f80076d0ff02f952a4cc39df5c9ee0dd039))
* **i18n:** update Finnish translations [skip ci] ([0a73633](https://github.com/discord-tickets/bot/commit/0a73633ea92f011cd0225e53212c6c096f727b70))
* **i18n:** update French translations [skip ci] ([f23b752](https://github.com/discord-tickets/bot/commit/f23b7522e8777d7903ff1b87ba03362405c11f4c))
* **i18n:** update German translations [skip ci] ([f8450af](https://github.com/discord-tickets/bot/commit/f8450af34ef17d6bbd4f7356792d9e0b3664577a))
* **i18n:** update German translations [skip ci] ([6a25e3e](https://github.com/discord-tickets/bot/commit/6a25e3efb918e7601d5d60f330d6d2bac922719f))
* **i18n:** update German translations [skip ci] ([6b70e31](https://github.com/discord-tickets/bot/commit/6b70e315b589e224ef783a56562065a8426c93b7))
* **i18n:** update German translations [skip ci] ([12d97ee](https://github.com/discord-tickets/bot/commit/12d97ee816bf4b1fb1a9e46113ae0458e251a93d))
* **i18n:** update German translations [skip ci] ([ecf9510](https://github.com/discord-tickets/bot/commit/ecf95100c0724883feb987e80a1881f9b28859d6))
* **i18n:** update Hungarian translations [skip ci] ([ee90fed](https://github.com/discord-tickets/bot/commit/ee90fed50a3097d044299d5aa4bcaa2ac914468d))
* **i18n:** update Hungarian translations [skip ci] ([955feda](https://github.com/discord-tickets/bot/commit/955feda708f99bd407582210bf6cda3dfa77db8f))
* **i18n:** update Italian translations [skip ci] ([68765e5](https://github.com/discord-tickets/bot/commit/68765e530b71d13a88c80e1a501f77a367f383c1))
* **i18n:** update Italian translations [skip ci] ([259a033](https://github.com/discord-tickets/bot/commit/259a033752583cf78113253d4c76a71e9db6e817))
* **i18n:** update Italian translations [skip ci] ([46225f2](https://github.com/discord-tickets/bot/commit/46225f215d1dbbb508e85d82dfca56d401f62134))
* **i18n:** update Italian translations [skip ci] ([ab470f9](https://github.com/discord-tickets/bot/commit/ab470f948bafd46136e76879ddee252ec8d163a1))
* **i18n:** update Russian translations [skip ci] ([d7e538e](https://github.com/discord-tickets/bot/commit/d7e538ee3c0b19607c309675cb3a8d87370a382a))
* **i18n:** update Russian translations [skip ci] ([ac58cde](https://github.com/discord-tickets/bot/commit/ac58cdea975a2f6fda766db96042c501e21e3260))
* **i18n:** update Russian translations [skip ci] ([1dd4449](https://github.com/discord-tickets/bot/commit/1dd444926024a37515e62847704874e0ce1a1145))
* **i18n:** update Russian translations [skip ci] ([ebcf81f](https://github.com/discord-tickets/bot/commit/ebcf81f8d32882ed401d4a8d33e74165b058c7e2))
* **i18n:** update Turkish translations [skip ci] ([325fe1d](https://github.com/discord-tickets/bot/commit/325fe1d1c03bab17ea41a66f31251707ed0f44c8))
* **i18n:** update Turkish translations [skip ci] ([42bfb17](https://github.com/discord-tickets/bot/commit/42bfb17b5b5c787e954376cfe9c162407c0bbbad))
* inactivity warnings and automatic closure (closes [#299](https://github.com/discord-tickets/bot/issues/299) and [#305](https://github.com/discord-tickets/bot/issues/305)) ([3a47a7d](https://github.com/discord-tickets/bot/commit/3a47a7df3f5d5140066eef6a8efb69d20764c034))
* include category name in transcripts ([4dbbba6](https://github.com/discord-tickets/bot/commit/4dbbba6c0ba80d47f50cca66d1e46057c3f58c20))
* make closed ticket DM more useful ([a0ffbae](https://github.com/discord-tickets/bot/commit/a0ffbae36d4775afa8e3ec1133523bcc2f531e7d))
* notify when staff are offline (closes [#304](https://github.com/discord-tickets/bot/issues/304)) ([59dec28](https://github.com/discord-tickets/bot/commit/59dec2880414bc2e3c6712433717c5e56184e788))
* oauth2 callback redirect (closes [#333](https://github.com/discord-tickets/bot/issues/333)) ([aeb4450](https://github.com/discord-tickets/bot/commit/aeb4450a5693743d791261804289b6060c067eff))
* public bot warnings ([cd71843](https://github.com/discord-tickets/bot/commit/cd71843bb0b9abdac20f1450939b4a7ed8915b66))
* settings v2 ([96b5c92](https://github.com/discord-tickets/bot/commit/96b5c927432347a589c4bd59235a4ac42ab5f036))
* **translations:** add Chinese (Simplified) translation ([e768f2f](https://github.com/discord-tickets/bot/commit/e768f2f12e7fab63d9f3e688154f4b4ec9795b29))
* **translations:** add Chinese (Traditional) translation ([d686bf3](https://github.com/discord-tickets/bot/commit/d686bf334f3504d28be84ac719eba3b227e08de5))
* **translations:** add Hebrew (Israel) translation ([a875e15](https://github.com/discord-tickets/bot/commit/a875e1521df19a2f0db9c63299b87b9081273e32))
* **translations:** update Chinese (Simplified) translation ([401a854](https://github.com/discord-tickets/bot/commit/401a854135072c8fdf8e94579ef1baca58b7feeb))
* **translations:** update Chinese (Traditional) translation ([5436b84](https://github.com/discord-tickets/bot/commit/5436b846172614364a1dd1c0fc3650b9adc41e97))
* **translations:** update Chinese (Traditional) translation ([4c01e3d](https://github.com/discord-tickets/bot/commit/4c01e3dec8247852f5437ee2cab8bb6fea7ef968))
* **translations:** update Chinese (Traditional) translation ([07e41d6](https://github.com/discord-tickets/bot/commit/07e41d694698d082de027e5018ee3ead5345acd6))
* **translations:** update Chinese (Traditional) translation ([8176685](https://github.com/discord-tickets/bot/commit/81766857b3bdce2568c7ab96509c2e11267b29f4))
* **translations:** update Czech translation ([fdaeee9](https://github.com/discord-tickets/bot/commit/fdaeee9a7c207b61d5c719614a78c8002f7b7e68))
* **translations:** update Czech translation ([9ba3917](https://github.com/discord-tickets/bot/commit/9ba39174d8d43928f6584710ffca09d533bc43db))
* **translations:** update Dutch translation ([1698bbc](https://github.com/discord-tickets/bot/commit/1698bbcca659eb7ad999ba708abbc516fd3bacc7))
* **translations:** update English (United Kingdom) translation ([7bf6689](https://github.com/discord-tickets/bot/commit/7bf66896160fdb47c05643e04f365d6632485f50))
* **translations:** update French translation ([7903cdb](https://github.com/discord-tickets/bot/commit/7903cdbea08f34beb964492e5d8b6d74e297f3aa))
* **translations:** update French translation ([f3ac834](https://github.com/discord-tickets/bot/commit/f3ac834263fec755ec9a5d78e2755406af7b7b95))
* **translations:** update German translation ([07d5e89](https://github.com/discord-tickets/bot/commit/07d5e89673c3a041ccb97beb622b5281076a0454))
* **translations:** update German translation ([4ddf77b](https://github.com/discord-tickets/bot/commit/4ddf77bd2213ad1b248e5f810fde4905b8d747f5))
* **translations:** update German translation ([2f54e1a](https://github.com/discord-tickets/bot/commit/2f54e1ac193a3c7c83c269e982b8ea5ae780ebbd))
* **translations:** update German translation ([30bd6f0](https://github.com/discord-tickets/bot/commit/30bd6f02382d032b61c5e020bbd76f37623d8fc9))
* **translations:** update German translation ([a3e7ffc](https://github.com/discord-tickets/bot/commit/a3e7ffc24748a7e4ef305f68b6eef02d752b0870))
* **translations:** update Hebrew (Israel) translation ([6c8d776](https://github.com/discord-tickets/bot/commit/6c8d77624c807099c5b27867205ff4e95a115823))
* **translations:** update Hebrew (Israel) translation ([453f4c7](https://github.com/discord-tickets/bot/commit/453f4c74c3301124d6401267e16af81eec0e9982))
* **translations:** update Korean translation ([d72b51a](https://github.com/discord-tickets/bot/commit/d72b51ae9ea3c2ba6792e6673633e644458eea69))
* **translations:** update Polish translation ([3c3b7ec](https://github.com/discord-tickets/bot/commit/3c3b7ec63e023bc0443d33917743457bb92c401f))
* **translations:** update Spanish translation ([0951051](https://github.com/discord-tickets/bot/commit/09510512b3a6419861b713755c1ae5dad47c2103))
* **translations:** update Spanish translation ([697a1be](https://github.com/discord-tickets/bot/commit/697a1be7ae62dab530d87995b43b96b9db70409c))
* **translations:** update Vietnamese translation ([3a01eca](https://github.com/discord-tickets/bot/commit/3a01ecad245ae414a8457c8963cd70c5078ff656))
* update checker ([6133a3d](https://github.com/discord-tickets/bot/commit/6133a3d59f47dfe1f2ce3ed3181017930ec5ebd0))
* update command permissions (closes [#392](https://github.com/discord-tickets/bot/issues/392)) ([b14f057](https://github.com/discord-tickets/bot/commit/b14f057dd080bd8ef87d04f100b6e36ca2246ad5))
* use long format for category time stats ([65eb2a3](https://github.com/discord-tickets/bot/commit/65eb2a3e86fed254a2e85ab2e0c2a715b56e2600))
* validate environment variables at startup ([ea3413d](https://github.com/discord-tickets/bot/commit/ea3413d8cba0e68172a6c757e4d354515c0f2709))
* working hours ([#304](https://github.com/discord-tickets/bot/issues/304)) ([faf6edc](https://github.com/discord-tickets/bot/commit/faf6edc463044b37522003f97451dfcea41b4f76))


### Performance Improvements

* cache staff roles ([d7e1b05](https://github.com/discord-tickets/bot/commit/d7e1b05586d68cd90ff13fec6c5cbdc7a68522e1))
* cache tags ([db94ab7](https://github.com/discord-tickets/bot/commit/db94ab770de2bb2b7a2ca18412205a8b185528c6))
* **docker:** decrease image size by 35% ([d79701e](https://github.com/discord-tickets/bot/commit/d79701ea2c8c8bbfbeab03d4aeab69ac6674d04f))
* **docker:** reorder commands to improve caching (maybe?) ([64da241](https://github.com/discord-tickets/bot/commit/64da241a7649e51c02adad064bbeb4a264793089))
* improve `ticket`/`references` autocompleters (and de-duplicate) ([09095f7](https://github.com/discord-tickets/bot/commit/09095f71c112b24017762feb7907b8a05600ecbb))
* reduce database data transfer ([7417005](https://github.com/discord-tickets/bot/commit/741700578235e220e90f4bb1e67d2c9a3aec8ca7))
* select 10 rows in SQL rather than JS ([afa0123](https://github.com/discord-tickets/bot/commit/afa0123d228ac678d73d7d23a9dbe1c9d2d5a59d))


### Reverts

* Revert "Remove jsconfig.json" ([8e82b28](https://github.com/discord-tickets/bot/commit/8e82b2829f997e4c44499c70f78790ff64207768))
* Revert "Update index.js" ([2e23508](https://github.com/discord-tickets/bot/commit/2e2350806d9f17afecc5cc304cd862c1e24a202d))
* Revert "Change user avatar properties" ([e3b6244](https://github.com/discord-tickets/bot/commit/e3b6244729a89369fd4fa8f319a908791f88354c))



