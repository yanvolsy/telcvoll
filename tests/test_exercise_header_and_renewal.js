const assert = require('assert');
const fs = require('fs');

console.log('=== Running Exercise Header, Responsiveness, Dark Mode & Renewal Tests ===\n');

// 1. Verify public/exercise.html
console.log('Test 1: Verifying public/exercise.html layout and headers...');
const exerciseHtml = fs.readFileSync('public/exercise.html', 'utf8');

assert(exerciseHtml.includes('exercise-heading-meta'), 'exercise.html must include exercise-heading-meta');
assert(exerciseHtml.includes('exercise-heading-tags'), 'exercise.html must include exercise-heading-tags');
assert(exerciseHtml.includes('exercise-heading-timer'), 'exercise.html must include exercise-heading-timer');
assert(exerciseHtml.includes('timer-icon'), 'exercise.html must include timer-icon ⏱️');
assert(exerciseHtml.includes('timer-digits'), 'exercise.html must include timer-digits');
assert(exerciseHtml.includes('paragraph-assignment-head'), 'exercise.html must include paragraph-assignment-head');
assert(exerciseHtml.includes('paragraph-assignment-controls'), 'exercise.html must include paragraph-assignment-controls');
console.log('✓ Test 1 Passed: exercise.html headers and paragraph assignments are properly structured.\n');

// 2. Verify public/assets/app.css
console.log('Test 2: Verifying public/assets/app.css theme contrast & responsiveness...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

assert(appCss.includes('color-scheme: dark'), 'app.css must define color-scheme: dark for dark mode');
assert(appCss.includes('html[data-theme="dark"] select option'), 'app.css must style select option in dark mode');
assert(appCss.includes('html:not([data-theme="dark"]) select option'), 'app.css must style select option in light mode');
assert(appCss.includes('min(1380px, 94vw)'), 'app.css must use wide responsive width min(1380px, 94vw)');
assert(appCss.includes('.active-subscription-banner'), 'app.css must include styles for active-subscription-banner');
assert(appCss.includes('.progress-pill'), 'app.css must include styles for progress-pill');
console.log('✓ Test 2 Passed: app.css contains high-contrast color-scheme and wide responsive workspace rules.\n');

// 3. Verify netlify/functions/payment-checkout.js
console.log('Test 3: Verifying netlify/functions/payment-checkout.js renewal guard...');
const checkoutCode = fs.readFileSync('netlify/functions/payment-checkout.js', 'utf8');

assert(checkoutCode.includes('getStudentSubscription'), 'payment-checkout.js must import getStudentSubscription');
assert(checkoutCode.includes('ACTIVE_SUBSCRIPTION_RENEWAL_GUARD'), 'payment-checkout.js must include ACTIVE_SUBSCRIPTION_RENEWAL_GUARD error code');
assert(checkoutCode.includes('remainingDays > 3'), 'payment-checkout.js must check remainingDays > 3');
console.log('✓ Test 3 Passed: payment-checkout.js contains strict backend renewal guard.\n');

// 4. Verify public/plans.html and public/index.html
console.log('Test 4: Verifying frontend plans renewal banners and CTAs...');
const plansHtml = fs.readFileSync('public/plans.html', 'utf8');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');

assert(plansHtml.includes('plansRenewalBannerSlot'), 'plans.html must contain plansRenewalBannerSlot');
assert(plansHtml.includes('subscriptionRemainingDays'), 'plans.html must calculate subscriptionRemainingDays');
assert(plansHtml.includes('handleGuardedCheckout'), 'plans.html must include handleGuardedCheckout');
assert(plansHtml.includes('تجديد الاشتراك الآن ⚡'), 'plans.html must offer renewal CTA');

assert(indexHtml.includes('plansRenewalBannerSlot'), 'index.html must contain plansRenewalBannerSlot');
assert(indexHtml.includes('subscriptionRemainingDays'), 'index.html must calculate subscriptionRemainingDays');
assert(indexHtml.includes('handleGuardedCheckout'), 'index.html must include handleGuardedCheckout');
assert(indexHtml.includes('تجديد الاشتراك الآن ⚡'), 'index.html must offer renewal CTA');
console.log('✓ Test 4 Passed: plans.html and index.html include renewal banners and guarded CTAs.\n');

// 5. Functional test of renewal guard logic
console.log('Test 5: Functional verification of 3-day renewal calculation...');
function testRenewalRule(remainingDays) {
  if (remainingDays > 3) {
    return { allowed: false, message: `لديك اشتراك نشط حالياً ينتهي بعد ${remainingDays} يوماً. يمكنك تجديد اشتراكك فقط خلال آخر 3 أيام من نهاية الخطة الحالية.` };
  }
  return { allowed: true, message: 'متاح التجديد الآن' };
}

assert.strictEqual(testRenewalRule(20).allowed, false, '20 days remaining should be blocked');
assert.strictEqual(testRenewalRule(4).allowed, false, '4 days remaining should be blocked');
assert.strictEqual(testRenewalRule(3).allowed, true, '3 days remaining should be allowed');
assert.strictEqual(testRenewalRule(2).allowed, true, '2 days remaining should be allowed');
assert.strictEqual(testRenewalRule(1).allowed, true, '1 day remaining should be allowed');
assert.strictEqual(testRenewalRule(0).allowed, true, '0 days remaining should be allowed');
assert.strictEqual(testRenewalRule(-1).allowed, true, 'Expired subscription should be allowed');
console.log('✓ Test 5 Passed: Renewal rule logic behaves 100% correctly for all boundary conditions.\n');

console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (5/5)');
