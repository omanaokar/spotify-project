const SpotifyWebApi = require('../');

/**
 * This example refreshes an access token. Refreshing access tokens is only possible access tokens received using the
 * Authorization Code flow, documented here: https://developer.spotify.com/spotify-web-api/authorization-guide/#authorization_code_flow
 */

/* Retrieve an authorization code as documented here:
 * https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow
 * or in the Authorization section of the README.
 *
 * Codes are given for a set of scopes. For this example, the scopes are user-read-private and user-read-email.
 * Scopes are documented here:
 * https://developer.spotify.com/documentation/general/guides/scopes/
 */
