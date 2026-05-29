import axios from 'axios';

// Configure Axios defaults globally
axios.defaults.baseURL = 'http://localhost:8082';
axios.defaults.withCredentials = true;

/**
 * fetchModel - Fetch a model from the web server using Axios.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns {Promise}       A promise that resolves with the JSON data from
 *                          the server, or rejects with an error.
 */
function fetchModel(url) {
  return axios.get(url)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Error fetching model:', error);
      throw error;
    });
}

export default fetchModel;
