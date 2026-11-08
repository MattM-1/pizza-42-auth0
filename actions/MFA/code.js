/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/

const MFA_ACR = 'http://schemas.openid.net/pape/policies/2007/06/multi-factor';

exports.onExecutePostLogin = async (event, api) => {
  if (event.request?.query?.acr_values !== MFA_ACR) return;

  const enrolledFactors = event.user.enrolledFactors;

  if (enrolledFactors && enrolledFactors.length > 0) {
    // Enrolled: challenge with any of their enrolled factors.
    api.authentication.challengeWithAny(enrolledFactors.map((factor) => ({ type: factor.type })));
  } else {
    // Not enrolled in anything: enroll them with OTP.
    api.authentication.enrollWith({ type: 'otp' });
  }
};