require("dotenv").config();
var axios = require("axios");
const APIKEY = process.env.TWO_FACTOR_API_KEY;

exports.urlSendTestOtp = async (mobile) => {
  try {
    var config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://2factor.in/API/V1/${APIKEY}/SMS/${mobile}/AUTOGEN`,
      headers: {},
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log("error: ", error.response?.data || error.message);
    throw error;
  }
};

exports.urlVerifyOtp = async (sessionId, otp) => {
  try {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://2factor.in/API/V1/${APIKEY}/SMS/VERIFY/${sessionId}/${otp}`,
      headers: {},
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log("Error: ", error.message);
    throw error;
  }
};
