 const calculateTotalPrice = (startDate, endDate, costPerNight) => {
    try {
      
    // Parse the dates to ensure they are valid Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Check if the dates are valid
    if (isNaN(start) || isNaN(end)) {
       return res.status(422).send('Invalid Dates')
    }
  
    // Calculate the number of nights
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const numberOfNights = Math.ceil((end - start) / millisecondsPerDay);
  
    // Calculate the total price
    return numberOfNights * costPerNight;

  } catch (error) {
      console.log(error);
      res.status(422).json(error.message)
  }
  };
module.exports = calculateTotalPrice