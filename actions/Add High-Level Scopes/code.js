/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
/**
 * Auth0 Action: Post Login — grant create:large-orders only when MFA was required and completed
 * in this login transaction.
 *
 * Both checks are needed:
 *  - the MFA Action marked this transaction (mfa_triggered), so MFA was triggered by this login and
 *    not left over from an earlier login in the same Auth0 session, and
 *  - an MFA method is recorded, so the challenge or enrollment actually completed.
 */
const STEP_UP_FACTORS = ['otp', 'email']; // the factors the MFA Action offers

exports.onExecutePostLogin = async (event, api) => {
  const mfaTriggered = event.transaction?.metadata?.mfa_triggered === true;

  const methods = event.authentication?.methods ?? [];
  const mfaCompleted = methods.some((m) => m.name === 'mfa' && STEP_UP_FACTORS.includes(m.type));

  if (mfaTriggered && mfaCompleted) {
    api.accessToken.addScope('create:large-orders');
  }
};
