import axios, { Axios, AxiosError, AxiosResponse, Method } from "axios";

export async function makeApiCall(
  url: string,
  method: Method,
  data?: any,
): Promise<any | Error> {
  try {
    // Make a GET request to the API endpoint
    const response: AxiosResponse = await axios.request({
      url,
      method,
      data,
    });

    // Access the response data
    const responseData = response.data;
    return responseData;
  } catch (error) {
    console.error(`Network Lib: Error making API call!`);
    if (error instanceof AxiosError) {
      console.log(error.code, error.message);
    }
    return error;
  }
}
