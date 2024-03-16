import axios, {
  Axios,
  AxiosError,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
} from "axios";

export async function makeApiCall(
  url: string,
  method: Method,
  headers?: AxiosRequestHeaders,
  data?: any,
): Promise<any | Error> {
  try {
    // Make a request to the API endpoint
    const response: AxiosResponse = await axios.request({
      url,
      method,
      data,
      headers: headers || {},
    });

    // Access the response data
    const responseData = response.data;
    return responseData;
  } catch (error) {
    console.error(`Network Lib: Error making API call! ${error}`);
    if (error instanceof AxiosError) {
      console.log(error.code, error.message);
    }
    return error;
  }
}
