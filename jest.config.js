{
  "preset": "ts-jest/presets/js-with-babel",
  "testEnvironment": "node",
  "transform": {},
  "extensionsToTreatAsEsm": [".js"],
  "globals": {
    "ts-jest": {
      "useESM": true
    }
  },
  "moduleNameMapper": {
    "^#models/(.*)": "<rootDir>/src/models/$1",
    "^#schemas/(.*)": "<rootDir>/src/schemas/$1"
  }
}
