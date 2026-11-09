/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/

const MFA_ACR = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor';
const STEP_UP_FACTORS = ['otp', 'email']; // webauthn is first-factor only

// The only place MFA is triggered. It marks this login transaction first, so the
// "Add High-Level Scopes" Action can tell that MFA was required in THIS transaction.
// Later Actions do not run until the user fulfills the challenge or enrollment.
function requireMfa(event, api) {
  api.transaction.setMetadata('mfa_triggered', true);

  const enrolledFactors = event.user.enrolledFactors ?? [];

  // A verified email appears as an "email" factor even if the user never enrolled in MFA,
  // so only a non-email factor counts as being enrolled.
  const alreadyEnrolled = enrolledFactors.some((f) => f.type !== 'email');

  if (alreadyEnrolled) {
    // Challenge with OTP/email if they have them, otherwise fall back to email (WebAuthn-only users).
    const factors = enrolledFactors.filter((f) => STEP_UP_FACTORS.includes(f.type));
    const toChallenge = factors.length > 0 ? factors : [{ type: 'email' }];
    api.authentication.challengeWithAny(toChallenge.map((f) => ({ type: f.type })));
  } else {
    // Not enrolled in anything: enroll them with TOTP.
    api.authentication.enrollWith({ type: 'otp' });
  }
}

exports.onExecutePostLogin = async (event, api) => {
  if (event.request?.query?.acr_values !== MFA_ACR) return;

  requireMfa(event, api);
};
