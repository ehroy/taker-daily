import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getRandomFromTxt, log } from "../utils/utils.js";
import config from "../config/config.json"  with { type: "json" };
const { PROXY } = config;
export async function Curl(
  url,
  body = null,
  headers = {},
  maxRetries = 100,
  retryDelay = 2000
) {
  let attempt = 0;

  // Proxy setup
  const httpsAgent = new HttpsProxyAgent(PROXY);

  while (attempt < maxRetries) {
    try {
      attempt++;

      const options = {
        method: body ? "POST" : "GET",
        url: url,
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
          ...headers,
        },
        timeout: 10000, // 10s timeout
        httpsAgent: httpsAgent,
        data: body,
        validateStatus: () => true, // Handle all status codes manually
      };

      const response = await axios(options);

      const contentType = response.headers["content-type"];
      const cookies = response.headers["set-cookie"];
      const cookie = cookies ? cookieHelpers(cookies) : null;
      const status = response.status;
      const redirect = response.headers["location"] || null;

      let data;
      try {
        if (contentType && contentType.includes("application/json")) {
          data = response.data;
        } else {
          data = typeof response.data === "string" ? response.data : "";
        }
        log(
          `🔄 Attempt ${attempt}/${maxRetries} - Fetched ${url} successfully.`,
          "success"
        );
      } catch (error) {
        data = "Error parsing response data";
      }

      return { data, cookie, redirect, status };
    } catch (error) {
      if (attempt >= maxRetries) {
        log(`❌ Request failed after ${maxRetries} attempts`, "error");
        throw new Error("Request failed after maximum retries");
      }

      log(`⚠️ Axios failed (Attempt ${attempt}): ${error.message}`, "error");
      log(`⏳ Retrying in ${retryDelay / 1000} seconds...`, "warning");
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // retryDelay *= 2; // Enable for exponential backoff if needed
    }
  }
}
