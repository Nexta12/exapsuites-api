 const calculateTotalPrice = (startDate, endDate, costPerNight) => {
    // Parse the dates to ensure they are valid Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Check if the dates are valid
    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid startDate or endDate");
    }
  
    // Ensure the endDate is after the startDate
    if (end <= start) {
      throw new Error("endDate must be after startDate");
    }
  
    // Calculate the number of nights
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const numberOfNights = Math.ceil((end - start) / millisecondsPerDay);
  
    // Calculate the total price
    return numberOfNights * costPerNight;
  };
module.exports = calculateTotalPrice