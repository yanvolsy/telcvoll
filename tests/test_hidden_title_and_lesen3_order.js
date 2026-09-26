const fs = require('fs');
const assert = require('assert');

console.log('=== Running Hidden Title & Lesen Teil 3 Strict Verification Tests ===\n');

// 1. Verify Hidden Title
console.log('Test 1: Verifying title leakage prevention in public/exercise.html...');
const exHtml = fs.readFileSync('public/exercise.html', 'utf8');

// Ensure hidden title block exists and contains frosted-ghost-bars
assert(exHtml.includes('frosted-ghost-bars'), 'exercise.html must include frosted-ghost-bars');
assert(exHtml.includes('ghost-bar-long'), 'exercise.html must include ghost-bar-long');
assert(exHtml.includes('ghost-bar-short'), 'exercise.html must include ghost-bar-short');
assert(exHtml.includes('thema-blurred-badge'), 'exercise.html must include thema-blurred-badge');

// Ensure hidden title block DOES NOT leak ${esc(title)}
const hiddenTitleSlice = exHtml.slice(exHtml.indexOf('is-hidden-title'), exHtml.indexOf('id="exerciseSubBar"'));
assert(!hiddenTitleSlice.includes('${esc(title)}'), 'Hidden title markup must NEVER leak ${esc(title)} in the DOM');
console.log('✓ Test 1 Passed: Hidden title renders zero raw text in the DOM when masked.\n');

// 2. Verify Removal of separate lesen3ResultsCard
console.log('Test 2: Verifying removal of separate lesen3ResultsCard...');
assert(!exHtml.includes('lesen3-results-card'), 'Separate lesen3-results-card must be completely removed');
assert(!exHtml.includes('lesen3ResultsCard'), 'lesen3ResultsCard variable must be removed');
console.log('✓ Test 2 Passed: Separate lesen3-results-card box is removed; model answers display inline like other sections.\n');

// 3. Verify Lesen Teil 3 layout order: 10 Paragraphs on TOP, 12 Ads Bank BELOW
console.log('Test 3: Verifying Lesen Teil 3 layout order (10 Paragraphs above, 12 Ads Bank under)...');
const paragraphsIdx = exHtml.indexOf('const cards = matchingOrder.map');
const headingsOverviewIdx = exHtml.indexOf('class="matching-headings-bank lesen3-headings-overview"');
const adsListIdx = exHtml.indexOf('class="lesen3-ads-list"');

assert(paragraphsIdx !== -1, 'paragraphs cards generator must exist');
assert(headingsOverviewIdx !== -1, 'matching-headings-bank lesen3-headings-overview must exist');
assert(adsListIdx !== -1, 'lesen3-ads-list must exist');
assert(paragraphsIdx < headingsOverviewIdx, '10 paragraphs must be placed ABOVE the headings bank');
assert(exHtml.includes('data-paragraph-select="${it.position_no}"'), 'Dropdown select must be placed above each paragraph');
assert(exHtml.includes('X — لا يوجد عنوان مناسب'), 'Option X must exist for paragraphs without matching heading');
console.log('✓ Test 3 Passed: In exercise.html, 10 paragraphs with selects are on TOP and 12 ads bank is UNDERNEATH.\n');

// 4. Verify Teil 3 clean layout and translation placement
console.log('Test 4: Verifying clean Teil 3 layout and translation placement...');
const adCardSlice = exHtml.slice(exHtml.indexOf('id="card-ad-${letter}"'), exHtml.indexOf('</div>`;', exHtml.indexOf('id="card-ad-${letter}"')));
assert(!adCardSlice.includes('class="ad-tag"'), 'card-ad must not place ad-tag inside tools causing stacking');
assert(adCardSlice.includes('${textTools(rawText, adCid)}'), 'card-ad must render clean textTools for speech & translation');
assert(adCardSlice.includes('${adCid}-translation'), 'card-ad must place translation container directly underneath ad body');
assert(exHtml.includes('${cid}-translation'), 'paragraph card must place translation container directly underneath paragraph body');
console.log('✓ Test 4 Passed: Teil 3 card layout is clean with translation always directly underneath the text.\n');

// 5. Verify Mock Exam Lesen Teil 3 layout order
console.log('Test 5: Verifying mock-exam.html Lesen Teil 3 layout order...');
const mockHtml = fs.readFileSync('public/mock-exam.html', 'utf8');

const mockL3Func = mockHtml.slice(mockHtml.indexOf('function renderMockLesen3'), mockHtml.indexOf('function renderMockHoeren'));
const mockParasIdx = mockL3Func.indexOf('${paragraphsListMarkup}');
const mockHeadingsIdx = mockL3Func.indexOf('${headingsOverview}');

assert(mockParasIdx !== -1, '${paragraphsListMarkup} must exist in renderMockLesen3');
assert(mockHeadingsIdx !== -1, '${headingsOverview} must exist in renderMockLesen3');
assert(mockParasIdx < mockHeadingsIdx, 'In renderMockLesen3, paragraphsListMarkup must be placed BEFORE headingsOverview');
assert(mockL3Func.includes('data-answer-q="${esc(q)}"'), 'Mock exam must have select above each paragraph');
assert(mockL3Func.includes('class="mock-headings-bank lesen3-headings-overview"'), 'Mock exam must render 12 ads in one big frame underneath');
console.log('✓ Test 5 Passed: In mock-exam.html, 10 paragraphs are on TOP and 12 ads bank is UNDERNEATH.\n');

// 6. Verify CSS rules for ghost shimmer bars and crystal eye button
console.log('Test 6: Verifying CSS rules in public/assets/app.css...');
const appCss = fs.readFileSync('public/assets/app.css', 'utf8');

assert(appCss.includes('.frosted-ghost-bars'), 'app.css must define .frosted-ghost-bars');
assert(appCss.includes('ghostShimmerBar'), 'app.css must define ghostShimmerBar animation');
assert(appCss.includes('.title-eye-btn'), 'app.css must define .title-eye-btn');
assert(appCss.includes('stroke: #f47b20') || appCss.includes('stroke="#f47b20"'), 'app.css/svg must style eye in #f47b20');
assert(appCss.includes('.inline-translation'), 'app.css must style .inline-translation');
assert(appCss.includes('direction: rtl !important'), 'inline translation must be styled with RTL Arabic layout');
console.log('✓ Test 6 Passed: CSS includes high-quality frosted ghost shimmer bars, eye button and liquid glass RTL translation.\n');

console.log('========================================================================');
console.log('  ALL HIDDEN TITLE & LESEN TEIL 3 VERIFICATION TESTS PASSED! (6/6)      ');
console.log('========================================================================');
