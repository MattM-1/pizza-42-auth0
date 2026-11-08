/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
const { randomUUID } = require('crypto');
const NAMESPACE = 'https://pizza42.example.com/';

exports.onExecutePostLogin = async (event, api) => {
  let customerId = event.user.app_metadata?.pizza42_customer_id;

  // First login: create the ID once. It is never overwritten after this.
  if (!customerId) {
    customerId = randomUUID();
    api.user.setAppMetadata('pizza42_customer_id', customerId);
  }

  api.idToken.setCustomClaim(`${NAMESPACE}customer_id`, customerId);
  api.accessToken.setCustomClaim(`${NAMESPACE}customer_id`, customerId);
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };
