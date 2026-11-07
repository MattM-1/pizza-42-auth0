/**
 * Auth0 Action: Post Login — ask for marketing opt-in once, then put the answer in the ID token.
 * Keep NAMESPACE identical to `claimsNamespace` in src/auth0.config.ts.
 */
const NAMESPACE = 'https://pizza42.example.com/';
const FORM_ID = 'ap_n8YSjD2xQ4MtVwKQoNBErj';
const YES_OPTION = 'Yes, email me specials and promotions'; // must match the form's option text exactly

exports.onExecutePostLogin = async (event, api) => {
  const optIn = event.user.app_metadata?.marketing_opt_in;

  if (optIn === undefined) {
    api.prompt.render(FORM_ID); // first login only; the claim is added in onContinuePostLogin
    return;
  }
  api.idToken.setCustomClaim(`${NAMESPACE}marketing`, { marketing_opt_in: optIn });
};

exports.onContinuePostLogin = async (event, api) => {
  const optIn = String(event.prompt?.fields?.marketing_opt_in) === YES_OPTION;
  api.user.setAppMetadata('marketing_opt_in', optIn);
  api.idToken.setCustomClaim(`${NAMESPACE}marketing`, { marketing_opt_in: optIn });
};