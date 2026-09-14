const { json } = require('./_lib/auth');
const { requireSession } = require('./_lib/guard');

// Cheap role probe (no DB query for the admin path) used by admin-bar.js to
// decide whether to render the Admin Mode overlay on the shared learner UI.
exports.handler = async (event) => {
  const session = await requireSession(event);
  if (!session) return json(200, { role: null });
  return json(200, { role: session.role });
};
