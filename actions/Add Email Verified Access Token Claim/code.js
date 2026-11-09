/**
 * Auth0 Action: Post Login — add the standard `email_verified` claim to the ACCESS token.
 *
 * `email_verified` is already in the ID token (the app requests the `email` scope), but Auth0 does
 * not add it to access tokens by default. The Pizza 42 API reads it from the access token so it
 * can refuse orders from customers whose email is not verified, instead of trusting the browser.
 *
 * The claim is not namespaced because it is a standard OIDC user-profile claim, which Auth0
 * allows on API access tokens. If a claim name were not allowed, Auth0 would silently leave it
 * out of the token, so check a decoded access token after deploying.
 */
exports.onExecutePostLogin = async (event, api) => {
  api.accessToken.setCustomClaim('email_verified', event.user.email_verified === true);
};