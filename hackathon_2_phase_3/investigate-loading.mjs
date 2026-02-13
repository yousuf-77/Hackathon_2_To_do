import { chromium } from 'playwright';

async function investigateLoading() {
  const browser = await chromium.launch({
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Listen for page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // Listen for network failures
  const networkFailures = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkFailures.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  // Listen for all requests
  const requests = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  // Navigate to the dashboard
  console.log('Navigating to http://localhost:3002/dashboard...');
  try {
    await page.goto('http://localhost:3002/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  } catch (error) {
    console.log('Navigation error:', error.message);
  }

  // Wait a bit to see what happens
  await page.waitForTimeout(5000);

  // Take screenshot
  console.log('\nTaking screenshot...');
  await page.screenshot({
    path: '/mnt/e/Hackathon_2_To_do/hackathon_2_phase_3/dashboard-screenshot.png',
    fullPage: true
  });

  // Check page state
  const pageTitle = await page.title();
  const pageUrl = page.url();
  const bodyText = await page.evaluate(() => document.body.innerText);

  // Get any loading indicators
  const loadingElements = await page.evaluate(() => {
    const loaders = document.querySelectorAll('[class*="loading"], [class*="spinner"], [role="status"]');
    return Array.from(loaders).map(el => ({
      tagName: el.tagName,
      className: el.className,
      textContent: el.textContent?.substring(0, 100)
    }));
  });

  console.log('\n=== PAGE STATE ===');
  console.log('Title:', pageTitle);
  console.log('URL:', pageUrl);
  console.log('Body text length:', bodyText.length);
  console.log('Body preview:', bodyText.substring(0, 500));

  console.log('\n=== LOADING ELEMENTS ===');
  console.log(JSON.stringify(loadingElements, null, 2));

  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
    if (msg.location) {
      console.log(`  Location: ${msg.location.url}:${msg.location.lineNumber}`);
    }
  });

  console.log('\n=== PAGE ERRORS ===');
  pageErrors.forEach(error => {
    console.log('Error:', error.message);
    if (error.stack) {
      console.log('Stack:', error.stack);
    }
  });

  console.log('\n=== NETWORK FAILURES ===');
  networkFailures.forEach(failure => {
    console.log(`[${failure.status}] ${failure.statusText}`);
    console.log(`  URL: ${failure.url}`);
  });

  console.log('\n=== NETWORK REQUESTS (last 20) ===');
  requests.slice(-20).forEach(req => {
    console.log(`[${req.resourceType}] ${req.method} ${req.url}`);
  });

  // Check for any React/Next.js specific issues
  const reactState = await page.evaluate(() => {
    return {
      hasReact: typeof window.React !== 'undefined' || typeof window.__NEXT_DATA__ !== 'undefined',
      nextData: window.__NEXT_DATA__ || null
    };
  });

  console.log('\n=== RESTATE/NEXT.JS STATE ===');
  console.log(JSON.stringify(reactState, null, 2));

  await browser.close();
  console.log('\nScreenshot saved to: /mnt/e/Hackathon_2_To_do/hackathon_2_phase_3/dashboard-screenshot.png');
}

investigateLoading().catch(console.error);
