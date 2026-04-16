import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 테스트 파일 위치
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    // 각 테스트 파일마다 독립된 환경
    isolate: true,
    // 환경변수 로드
    env: {
      NODE_ENV: "test",
    },
    // 커버리지 설정 (npm run test:coverage)
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
    },
  },
});
