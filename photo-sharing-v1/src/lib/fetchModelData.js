/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns {Promise}       A promise that resolves with the JSON data from
 *                          the server, or rejects with an error.
 */
function fetchModel(url) {
  // Backend server runs on port 8082
  const backendUrl = `http://localhost:8082${url}`;

  return fetch(backendUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Error fetching model:', error);
      throw error;
    });
}

export default fetchModel;
