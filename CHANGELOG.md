# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-03-02
### Fixed
- Addressed `invalid character 'd'` error when initialized via Stdio by removing `dotenv.config()` stdout logging pollution, ensuring pristine JSON-RPC communication.

## [1.0.4] - 2026-03-02
### Fixed
- Added `@babel/runtime` as a direct dependency. This resolves a `MODULE_NOT_FOUND` error that occurred when executing `npx -y @mob999/cube_mcp` due to `@cubejs-client/core` importing Babel helpers internally without specifying the runtime dependency.

## [1.0.2] - 2026-03-02
### Republish
- Fix npm publish error.

## [1.0.1] - 2026-03-02
### Republish
- Fix npm publish error.

## [1.0.0] - 2026-03-02
### Added
- Initial release of the Cube.js TypeScript MCP Server (`cube_mcp`).
- Implemented `discover_entities` tool for mapping dimensions and measures from the Cube semantic layer.
- Implemented `execute_query` tool to execute native JSON load queries against Cube.js.
- Enforced output truncation (`preview_limit`) to protect LLM context windows.
- Packaged as a global executable `cube-mcp` CLI.
