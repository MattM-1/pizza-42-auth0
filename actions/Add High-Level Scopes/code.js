/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
/**
 * Auth0 Action: Post Login — grant create:large-orders only after a step-up challenge.
 */
const STEP_UP_FACTORS = ['otp', 'email', 'webauthn-platform', 'webauthn-roaming'];

exports.onExecutePostLogin = async (event, api) => {
  const methods = event.authentication?.methods ?? [];
  const stepUpDone = methods.some((m) => m.name === 'mfa' && STEP_UP_FACTORS.includes(m.type));

  if (stepUpDone) {
    api.accessToken.addScope('create:large-orders');
  }
};