import axios from 'axios';

const requestWithRetry = async (url, options, retryCount = 1) => {
  try {
    const response = await axios({
      ...options,
      url,
      timeout: options?.timeout ?? 40000
    });

    return response.data;
  } catch (error) {
    if (retryCount > 0) {
      return requestWithRetry(url, options, retryCount - 1);
    }

    throw error;
  }
};

export { requestWithRetry };
