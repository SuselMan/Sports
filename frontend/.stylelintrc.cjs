module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // Common CSS-modules patterns / project conventions
    'selector-class-pattern': null,
    'custom-property-pattern': null,
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
  ],
};


