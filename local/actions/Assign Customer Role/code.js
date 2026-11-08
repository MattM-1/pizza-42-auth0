/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
const CUSTOMER_ROLE_ID = 'rol_0VHsGotzQbw5apbO'; // User Management → Roles → customer
const CUSTOMER_ROLE_NAME = 'customer';
const CACHE_KEY = 'mgmt-api-token';

// Reuse a cached Management API token; only request a new one when missing or about to expire.
async function getManagementToken(event, api) {
  const cached = api.cache.get(CACHE_KEY)?.value;
  if (cached) {
    const { token, expiresAt } = JSON.parse(cached);
    if (expiresAt > Date.now() + 60_000) return token;
  }

  const domain = event.secrets.DOMAIN;
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: event.secrets.CLIENT_ID,
      client_secret: event.secrets.CLIENT_SECRET,
      audience: `https://${domain}/api/v2/`,
    }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status}`);
  const { access_token, expires_in } = await res.json();

  api.cache.set(CACHE_KEY, JSON.stringify({ token: access_token, expiresAt: Date.now() + expires_in * 1000 }));
  return access_token;
}

exports.onExecutePostLogin = async (event, api) => {
  // Already has the role: RBAC supplies the scopes, nothing to do.
  if (event.authorization?.roles?.includes(CUSTOMER_ROLE_NAME)) return;

  // This login's token: add the customer scopes directly.
  api.accessToken.addScope('create:orders');
  api.accessToken.addScope('read:orders');

  // Assign the role so later logins get the scopes through RBAC.
  try {
    const token = await getManagementToken(event, api);
    const res = await fetch(
      `https://${event.secrets.DOMAIN}/api/v2/users/${encodeURIComponent(event.user.user_id)}/roles`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ roles: [CUSTOMER_ROLE_ID] }),
      },
    );
    if (!res.ok) throw new Error(`role assignment failed: ${res.status} ${await res.text()}`);
  } catch (err) {
    // Don't block login; the scopes were already added for this session.
    console.log('Assign Customer Role error:', err.message);
  }
};