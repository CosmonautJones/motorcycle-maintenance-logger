// Lighthouse CI configuration for UI addition features disabled
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        extraHeaders: {
          'X-Feature-Flags': JSON.stringify({
            'ui-addition': false,
            'enhanced-icons': false,
            'simplified-theme-toggle': false
          })
        },
        skipAudits: [
          'uses-http2',
          'canonical',
          'robots-txt'
        ]
      }
    },
    assert: {
      assertions: {
        // Should maintain baseline performance without icons
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.7 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 250 }],
        'speed-index': ['error', { maxNumericValue: 2800 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};