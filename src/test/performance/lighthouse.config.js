module.exports = {
  ci: {
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-results',
      reportDir: './lighthouse-results',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'performance': ['error', { minScore: 0.9 }],
        'accessibility': ['error', { minScore: 0.9 }],
        'best-practices': ['error', { minScore: 0.9 }],
        'seo': ['error', { minScore: 0.9 }],
        'cumulativeLayoutShift': ['error', { maxNumericValue: 0.1 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
      },
    },
  },
};
