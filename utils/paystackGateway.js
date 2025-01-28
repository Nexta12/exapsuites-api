const axios = require("axios");


module.exports = {
  initializePayment: async (form, mycallback) => {
    const options = {
      url: "https://api.paystack.co/transaction/initialize",
      headers: {
        authorization: `Bearer ${process.env.PAYSTACK_SECRETE_KEY}`,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      data: form, // No need to stringify, Axios will handle it
    };

    // 
    try {

      const response = await axios.post(options.url, options.data, {
        headers: options.headers,
      });
      

      mycallback(null, response.data); // Assuming mycallback follows the (error, data) convention

    } catch (error) {
     console.log(error)
       mycallback(error, null);
    }
  },

  verifyPayment: async (ref, mycallback )=>{
     const options = {
       url:
         "https://api.paystack.co/transaction/verify/" +
         encodeURIComponent(ref),
       headers: {
         authorization: `Bearer ${process.env.PAYSTACK_SECRETE_KEY}`,
         "content-type": "application/json",
         "cache-control": "no-cache",
       },
     };

     try {
       const response = await axios.get(options.url, {
         headers: options.headers,
       });

       mycallback(null, response.data);

     } catch (error) {
      console.error(error)
       mycallback(error, null);
     }
  }
};


