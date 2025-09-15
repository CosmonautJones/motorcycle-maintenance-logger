/**
 * Global teardown for visual regression tests
 * Cleans up test artifacts and generates reports
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown() {
  console.log('Cleaning up visual regression testing environment...');

  try {
    // Generate visual regression report
    const reportData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      commit: process.env.GITHUB_SHA || 'unknown',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      results: []
    };

    // Scan for test results
    const resultsDir = path.join(process.cwd(), 'test-results/visual-regression');
    if (fs.existsSync(resultsDir)) {
      const diffDir = path.join(resultsDir, 'diffs');
      if (fs.existsSync(diffDir)) {
        const diffFiles = fs.readdirSync(diffDir);
        reportData.hasDifferences = diffFiles.length > 0;
        reportData.diffFiles = diffFiles;

        if (diffFiles.length > 0) {
          console.log(`⚠️  Found ${diffFiles.length} visual differences:`);
          diffFiles.forEach(file => console.log(`   - ${file}`));
        } else {
          console.log('✅ No visual differences detected');
        }
      }
    }

    // Write final report
    const reportPath = path.join(resultsDir, 'visual-regression-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Clean up temporary files older than 7 days
    const tempDir = path.join(resultsDir, 'temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime < weekAgo) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Cleaned up old temp file: ${file}`);
        }
      });
    }

    console.log('✅ Visual regression teardown complete');

  } catch (error) {
    console.error('❌ Error during visual regression teardown:', error);
    // Don't throw - teardown should not fail the build
  }
}

module.exports = globalTeardown;