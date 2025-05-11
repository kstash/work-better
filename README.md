# WorkBetter

MSA 구조로 만들어진 백엔드 통합 모노 레포지토리입니다.

## Service apps

- `apps` 내부에는 도메인 기준으로 분리된 서비스들이 전부 `submodule` 로 연결되어 있으며, 서비스당 하나의 독립적인 NestJS 서버로서 구동이 가능하도록 설계하였습니다.
- 서비스간 `gRPC` 통신이 가능하도록 `.proto` 파일들에 대한 명세를 하나로 모아 [`work-better-protos`](https://github.com/kstash/work-better-protos) 레포지토리를 서비스의 `submodule`로 가집니다.

```
apps
    /auth >> [submodule]
        /src
            /grpc
              /protos >> [submodule]
              grpc.module.ts
            /oauth
            /session
            auth.module.ts
            main.ts
        ...
    /user >> [submodule]
        ...
    / ...
```

## Custom libraries

- `libs` 폴더는 서비스들간에 공통적으로 이용될 수 있는 `entity`, `filter`, `interceptor`, `util`, `config`, `dto`, `guard`, `interface` 등의 사항들을 `@work-better/core` 라는 이름의 패키지로 개별 서비스에서 이용 및 접근이 가능하도록 합니다. (추후 레포지토리로 생성한 뒤 패키지화 예정)
<!-- TODO: core에 다 몰아넣지 말고 따로 분리하는게 더 좋지 않을까? -->

```
libs
    /src
        /common
            /entities
            /utils
            ...
        /config
            ...
        ...
```
