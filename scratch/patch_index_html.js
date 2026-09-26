const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Add banner slot before plansGrid
if (!html.includes('id="plansRenewalBannerSlot"')) {
  html = html.replace('<div id="plansGrid" class="landing-plan-grid">', '<div id="plansRenewalBannerSlot"></div>\n    <div id="plansGrid" class="landing-plan-grid">');
  console.log('Banner slot added to index.html');
}

// 2. Add state variables
const oldVars = `let publicPlansList = [];
const checkoutModal = document.getElementById('checkoutModal');`;

const newVars = `let publicPlansList = [];
let currentSubscription = null;
let isUserPaid = false;
let subscriptionRemainingDays = null;
const checkoutModal = document.getElementById('checkoutModal');`;

if (html.includes(oldVars)) {
  html = html.replace(oldVars, newVars);
  console.log('Variables updated in index.html');
}

// 3. Update openCheckout
const oldOpenCheckout = `function openCheckout(plan) {
  if (isPlanFree(plan)) {
    location.href = '/register.html';
    return;
  }`;

const newOpenCheckout = `function handleGuardedCheckout(days) {
  alert('لديك اشتراك نشط حالياً ينتهي بعد ' + days + ' يوماً. يمكنك تجديد اشتراكك فقط خلال آخر 3 أيام من نهاية الخطة الحالية.');
}

function openCheckout(plan) {
  if (isPlanFree(plan)) {
    location.href = '/register.html';
    return;
  }
  if (isUserPaid && subscriptionRemainingDays !== null && subscriptionRemainingDays > 3) {
    handleGuardedCheckout(subscriptionRemainingDays);
    return;
  }`;

if (html.includes(oldOpenCheckout)) {
  html = html.replace(oldOpenCheckout, newOpenCheckout);
  console.log('openCheckout updated in index.html');
}

// 4. Update the initialization and plans rendering at bottom of index.html
const oldInit = `(async () => {
  try {
    const token = localStorage.getItem('telc_student_token');
    if (token) {
      const authSlot = document.getElementById('navAuthSlot');
      if (authSlot) {
        authSlot.innerHTML = \`
          <a class="btn small-btn" href="/dashboard.html">منصة الطالب</a>
          <a href="#" id="logoutLink" class="nav-logout-btn" style="color:var(--danger);font-size:13px;font-weight:800;padding:6px 10px;">خروج</a>
        \`;
      }
    }
    const { plans } = await api('public-plans');
    publicPlansList = plans || [];
    // Sort plans by duration ascending (shortest first)
    publicPlansList.sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));

    plansGrid.className = 'plans-grid-wrap';
    plansGrid.innerHTML = publicPlansList.length ? publicPlansList.map((p, i) => {
      const isFree = isPlanFree(p);
      const isFeatured = p.is_featured === true || p.is_featured === 'true' || (!isFree && p.duration_days === 30);
      const price = p.price_dzd ? Number(p.price_dzd).toLocaleString('fr-DZ') + ' دج' : (isFree ? 'مجاناً' : '2,500 دج');
      const planJson = JSON.stringify(p).replace(/"/g, '&quot;');
      return \`
        <article class="plans-card \${isFeatured ? 'featured' : ''}">
          \${isFeatured ? '<span class="plans-card-badge">الأكثر شعبية ✦</span>' : ''}
          <div class="plans-card-header">
            <h3>\${esc(p.name)}</h3>
            <div class="plans-card-price">\${price} <small>/ \${p.duration_days} يوم</small></div>
            <p class="muted" style="font-size:13.5px;margin:8px 0 0;line-height:1.6;">\${esc(p.description || 'وصول فوري وشامل لكافة التمارين والامتحانات والمساعد الذكي.')}</p>
          </div>
          <ul class="plans-card-features">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> تفعيل فوري لكافة مستويات B1, B2, C1</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> الوصول الكامل لمحاكاة الامتحان الكامل</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> استديو Sprechen Teil 1 وتوليد العروض</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> مساعد TELC الذكي الصوتي والكتابي</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> تصحيح فوري وحفظ سجل الأخطاء والتقدم</li>
          </ul>
          <button type="button" class="btn \${isFeatured ? '' : 'light'}" style="width:100%;font-weight:900;" onclick="openCheckout(\${planJson})">
            \${isFree ? 'بدء الحساب التجريبي مجاناً' : 'شراء الخطة والاشتراك الآن ⚡'}
          </button>
        </article>\`;
    }).join('') : \`<div class="card"><h3>\${t('plans_none_title')}</h3><p class="muted">\${t('plans_none_desc')}</p></div>\`;
  } catch(e) { plansGrid.innerHTML=\`<div class="card"><h3>\${t('plans_error_title')}</h3><p class="muted">\${t('plans_none_desc')}</p></div>\`; }
})();`;

const newInit = `(async () => {
  try {
    const token = localStorage.getItem('telc_student_token');
    if (token) {
      const authSlot = document.getElementById('navAuthSlot');
      if (authSlot) {
        authSlot.innerHTML = \`
          <a class="btn small-btn" href="/dashboard.html">منصة الطالب</a>
          <a href="#" id="logoutLink" class="nav-logout-btn" style="color:var(--danger);font-size:13px;font-weight:800;padding:6px 10px;">خروج</a>
        \`;
      }
      try {
        const meRes = await api('me');
        if (meRes?.student) {
          currentUser = meRes.student;
          currentSubscription = meRes.subscription || null;
          isUserPaid = !!(meRes.is_paid || currentSubscription?.active || currentSubscription?.is_paid);
          if (isUserPaid && currentSubscription?.expires_at) {
            const expTime = new Date(currentSubscription.expires_at).getTime();
            subscriptionRemainingDays = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
          }
        }
      } catch (_) {}
    }
    const { plans } = await api('public-plans');
    publicPlansList = plans || [];
    // Sort plans by duration ascending (shortest first)
    publicPlansList.sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));

    // Render Active Subscription Guard Banner if applicable
    const bannerSlot = document.getElementById('plansRenewalBannerSlot');
    if (bannerSlot) {
      if (isUserPaid && subscriptionRemainingDays !== null) {
        if (subscriptionRemainingDays > 3) {
          bannerSlot.innerHTML = \`
            <div class="active-subscription-banner guarded">
              <div class="sub-banner-left">
                <div class="sub-banner-badge">🛡️</div>
                <div class="sub-banner-text">
                  <h3>لديك اشتراك نشط حالياً (\${currentSubscription?.plan_name || 'اشتراك كامل'})</h3>
                  <p>ينتهي اشتراكك بعد <strong>\${subscriptionRemainingDays} يوماً</strong>. وفقاً لسياسة المنصة، يمكنك تجديد خطتك أو الاشتراك من جديد فقط خلال <strong>آخر 3 أيام</strong> من نهاية اشتراكك الحالي.</p>
                </div>
              </div>
              <div class="sub-banner-days">
                <span class="days-num">\${subscriptionRemainingDays}</span>
                <span class="days-label">يوم متبقي للتجديد</span>
              </div>
            </div>
          \`;
        } else {
          bannerSlot.innerHTML = \`
            <div class="active-subscription-banner can-renew">
              <div class="sub-banner-left">
                <div class="sub-banner-badge">⚡</div>
                <div class="sub-banner-text">
                  <h3>تجديد الاشتراك متاح الآن</h3>
                  <p>ينتهي اشتراكك قريباً (\${subscriptionRemainingDays <= 0 ? 'اليوم' : 'خلال ' + subscriptionRemainingDays + ' أيام'}). يمكنك الآن تجديد خطتك لضمان استمرار التدريب والوصول لكافة التمارين والمساعد الذكي دون انقطاع.</p>
                </div>
              </div>
              <div class="sub-banner-days">
                <span class="days-num">\${Math.max(0, subscriptionRemainingDays)}</span>
                <span class="days-label">\${subscriptionRemainingDays <= 0 ? 'اليوم الأخير' : 'أيام متبقية'}</span>
              </div>
            </div>
          \`;
        }
      } else {
        bannerSlot.innerHTML = '';
      }
    }

    plansGrid.className = 'plans-grid-wrap';
    plansGrid.innerHTML = publicPlansList.length ? publicPlansList.map((p, i) => {
      const isFree = isPlanFree(p);
      const isFeatured = p.is_featured === true || p.is_featured === 'true' || (!isFree && p.duration_days === 30);
      const price = p.price_dzd ? Number(p.price_dzd).toLocaleString('fr-DZ') + ' دج' : (isFree ? 'مجاناً' : '2,500 دج');
      const planJson = JSON.stringify(p).replace(/"/g, '&quot;');
      let btnHtml = '';
      if (isFree) {
        btnHtml = \`<button type="button" class="btn light" style="width:100%;font-weight:900;" onclick="openCheckout(\${planJson})">بدء الحساب التجريبي مجاناً</button>\`;
      } else if (isUserPaid && subscriptionRemainingDays !== null && subscriptionRemainingDays > 3) {
        btnHtml = \`<button type="button" class="btn btn-renew-disabled" style="width:100%;font-weight:900;" onclick="handleGuardedCheckout(\${subscriptionRemainingDays})" title="التجديد متاح خلال آخر 3 أيام من نهاية الخطة">الخطة مفعلة حالياً (متاح التجديد قبل 3 أيام)</button>\`;
      } else if (isUserPaid && subscriptionRemainingDays !== null && subscriptionRemainingDays <= 3) {
        btnHtml = \`<button type="button" class="btn \${isFeatured ? '' : 'light'}" style="width:100%;font-weight:900;" onclick="openCheckout(\${planJson})">تجديد الاشتراك الآن ⚡</button>\`;
      } else {
        btnHtml = \`<button type="button" class="btn \${isFeatured ? '' : 'light'}" style="width:100%;font-weight:900;" onclick="openCheckout(\${planJson})">شراء الخطة والاشتراك الآن ⚡</button>\`;
      }

      return \`
        <article class="plans-card \${isFeatured ? 'featured' : ''}">
          \${isFeatured ? '<span class="plans-card-badge">الأكثر شعبية ✦</span>' : ''}
          <div class="plans-card-header">
            <h3>\${esc(p.name)}</h3>
            <div class="plans-card-price">\${price} <small>/ \${p.duration_days} يوم</small></div>
            <p class="muted" style="font-size:13.5px;margin:8px 0 0;line-height:1.6;">\${esc(p.description || 'وصول فوري وشامل لكافة التمارين والامتحانات والمساعد الذكي.')}</p>
          </div>
          <ul class="plans-card-features">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> تفعيل فوري لكافة مستويات B1, B2, C1</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> الوصول الكامل لمحاكاة الامتحان الكامل</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> استديو Sprechen Teil 1 وتوليد العروض</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> مساعد TELC الذكي الصوتي والكتابي</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> تصحيح فوري وحفظ سجل الأخطاء والتقدم</li>
          </ul>
          \${btnHtml}
        </article>\`;
    }).join('') : \`<div class="card"><h3>\${t('plans_none_title')}</h3><p class="muted">\${t('plans_none_desc')}</p></div>\`;
  } catch(e) { plansGrid.innerHTML=\`<div class="card"><h3>\${t('plans_error_title')}</h3><p class="muted">\${t('plans_none_desc')}</p></div>\`; }
})();`;

let normHtml = html.replace(/\r\n/g, '\n');
let normOldInit = oldInit.replace(/\r\n/g, '\n');

if (normHtml.includes(normOldInit)) {
  normHtml = normHtml.replace(normOldInit, newInit);
  console.log('Init replaced in index.html');
} else {
  console.log('Init direct match failed in index.html');
}

if (html.includes('\r\n')) normHtml = normHtml.replace(/\n/g, '\r\n');
fs.writeFileSync('public/index.html', normHtml, 'utf8');
console.log('public/index.html successfully updated!');
