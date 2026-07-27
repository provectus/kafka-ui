# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 참고할 안내를 제공합니다.

## 프로젝트 개요

**kafka-ui** (UI for Apache Kafka)는 Provectus가 만든, Apache Kafka 클러스터를 모니터링하고 관리하기 위한 무료 오픈소스 웹 UI입니다. 주요 기능: 다중 클러스터 관리, 메트릭 대시보드, 브로커/토픽/파티션/컨슈머 그룹 조회, 메시지 브라우징(JSON/plain/Avro/Protobuf), 동적 토픽 설정, Schema Registry, Kafka Connect, ksqlDB, OAuth2(Github/Gitlab/Google), 커스텀 serde 플러그인, RBAC, 데이터 마스킹. Docker 이미지(`provectuslabs/kafka-ui`)로 배포됩니다.

## 모듈 구조

Maven 멀티모듈 프로젝트(루트 `pom.xml`, `com.provectus:kafka-ui`)이며, Maven이 아닌 모듈이 하나 있습니다:

- **`kafka-ui-api`** — Spring Boot 3.1(WebFlux) 백엔드, Java 17. 메인 패키지는 `src/main/java` 하위의 `com.provectus.kafka.ui`이며, 하위 패키지는 `client`, `config`, `controller`, `emitter`, `exception`, `mapper`, `model`, `serdes`, `service`, `util`. `kafka-ui-contract`(생성된 OpenAPI 서버 스텁)와 `kafka-ui-serde-api`에 의존합니다.
- **`kafka-ui-contract`** — OpenAPI 스펙. `openapi-generator-maven-plugin`을 통해 Spring WebFlux 서버 스텁을 생성하며(`kafka-ui-api`가 사용), 동일한 계약(contract)으로 프론트엔드 API 클라이언트도 생성됩니다(아래 참고).
- **`kafka-ui-serde-api`** — 커스텀 메시지 포맷(예: AWS Glue)을 위한 serde(직렬화/역직렬화) 플러그인 SPI를 정의하는 독립 라이브러리. 별도 버전으로 Maven Central에 배포됩니다. 저장소의 다른 모듈과 달리 Java 8 source/target을 사용합니다.
- **`kafka-ui-e2e-checks`** — E2E 테스트: Selenium 4 + Selenide + TestNG, Allure 리포팅, 브라우저 그리드용 Selenoid.
- **`kafka-ui-react-app`** — React + TypeScript + Vite 프론트엔드. **Maven 모듈이 아니며** pnpm으로 별도 빌드됩니다. Node `18.17.1`, pnpm `8.6.12`로 버전이 고정되어 있습니다(`package.json`의 engines / 루트 pom 속성).

## 빌드 & 테스트 명령어

### 백엔드 (`kafka-ui-api`, 저장소 루트에서 실행, `./mvnw` 래퍼 사용 — 시스템에 Maven이 설치되어 있다고 가정하지 말 것)
```
./mvnw -B -ntp verify                                  # 전체 빌드 + 테스트 + checkstyle
./mvnw clean install -Pprod -Dmaven.test.skip=true     # 테스트를 건너뛰는 프로덕션 빌드
```
Checkstyle은 `validate` 단계에 바인딩되어 있으며(`etc/checkstyle/checkstyle.xml`, 헤더 `etc/checkstyle/apache-header.txt`), 위반 시 테스트 소스 포함하여 **빌드가 실패**합니다.

### 프론트엔드 (`kafka-ui-react-app`)
```
pnpm install --frozen-lockfile
pnpm gen:sources     # OpenAPI 계약으로부터 src/generated-sources 재생성 — 생성된 코드는 직접 수정하지 말 것
pnpm start           # 개발 서버 (vite)
pnpm build           # 프로덕션 빌드
pnpm lint            # eslint (airbnb + airbnb-typescript + prettier)
pnpm lint:CI         # eslint --max-warnings=0
pnpm test            # jest --watch
pnpm test:CI         # jest coverage, CI 모드
pnpm tsc             # tsc --noEmit 타입 체크
```

### E2E (`kafka-ui-e2e-checks`)
```
docker pull selenoid/vnc_chrome:103.0
docker-compose -f kafka-ui-e2e-checks/docker/selenoid-local.yaml up -d
docker-compose -f documentation/compose/e2e-tests.yaml up -d   # kafka-ui + Kafka + Schema Registry + Connect + ksqlDB 기동
./mvnw -Dsurefire.suiteXmlFiles='src/test/resources/smoke.xml' -f 'kafka-ui-e2e-checks' test -Pprod
```
다른 스위트: `sanity.xml`, `regression.xml` (`smoke.xml` 자리에 대신 사용). 로컬에 설치된 Chrome을 Selenoid 대신 사용하려면 `-Dbrowser=local`을 추가.

## 코드 컨벤션

- **Java**: 빌드 시 checkstyle 강제 적용(`etc/checkstyle/checkstyle.xml`); Apache 라이선스 헤더 필수(`etc/checkstyle/apache-header.txt`).
- **REST API 네이밍**: 소문자, 복수형 명사, 하이픈으로 구분된 경로; camelCase 쿼리 파라미터; 모델명은 복수형 명사, camelCase.
- **프론트엔드**: ESLint(airbnb/airbnb-typescript) + Prettier; 커밋 전 `pnpm lint:fix` 실행.
- `kafka-ui-react-app/src/generated-sources/**`는 절대 직접 수정하지 말 것 — `pnpm gen:sources`로 OpenAPI 계약으로부터 재생성됨.

## 로컬 개발

`documentation/compose/`에 로컬 클러스터용 docker-compose 예제가 다수 있습니다: `kafka-ui.yaml`(기본), `kafka-ssl*.yaml`, `kafka-ui-sasl.yaml`, `ldap.yaml`, `kafka-ui-with-jmx-exporter.yaml`, `kafka-ui-arm64.yaml` 등 — 자세한 내용은 `documentation/compose/DOCKER_COMPOSE.md` 참고.

## PR / 기여 관련 메모 (`CONTRIBUTING.md` 참고)

- 브랜치 네이밍: `issues/xxx`, `feature/feature_name`, `bugfix/fix_thing`.
- 사용자에게 노출되는 인터페이스(신규 환경변수, 포트, 파일, 컨테이너 파라미터 등) 변경 시 `README.md` 갱신.
- 이슈 연결 시 커밋/PR에 GitHub의 closing keyword 사용.
