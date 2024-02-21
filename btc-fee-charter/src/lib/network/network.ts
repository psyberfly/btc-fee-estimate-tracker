import axios, { AxiosResponse, Method } from "axios";

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
    console.error("Network Lib: Error making API call!");
    return (error);
  }
}
