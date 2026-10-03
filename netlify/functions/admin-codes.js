const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  return json(410, { error: 'نظام رموز الوصول أُزيل من المنصة. استخدم إدارة الخطط والاشتراكات.' });
};
