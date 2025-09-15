// Lighthouse CI configuration for UI addition features enabled
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8000'],
      numberOfRuns: 5, // More runs for accuracy with icons
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        extraHeaders: {
          'X-Feature-Flags': JSON.stringify({
            'ui-addition': true,
            'enhanced-icons': true,
            'simplified-theme-toggle': true
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
        // Slightly relaxed performance due to icon loading
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.7 }],
        // Account for icon loading impact
        'first-contentful-paint': ['error', { maxNumericValue: 2200 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.15 }],
        'total-blocking-time': ['error', { maxNumericValue: 400 }],
        'speed-index': ['error', { maxNumericValue: 3200 }],
        // Icon-specific audits
        'unused-css-rules': ['warn', { maxLength: 10 }],
        'resource-summary': ['warn', { maxNumericValue: 50 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};