const Bookings = require("../models/Booking");
const Apartment = require("../models/Apartment");
const Contact = require("../models/Contact");
const Expenses = require("../models/Expenses");

module.exports = {
  dashboardStats: async (req, res) => {
    try {
      //   Get Vacant Flats
      const vacantFlat = await Apartment.find({ bookingStatus: "free" });

      //  Active Guest from occupied Flats
      const activeGuests = await Apartment.find({ bookingStatus: "occupied" });

      //  Get New or Unread Messages:
      const newMessages = await Contact.find({ isRead: false });

      // Total Bookings This Month,
      const bookings = await Bookings.find({ status: "completed" });
      // Filter bookings for the current month and previous month.

      //Calculate the total payment for the current month.

      //Calculate the total payment for the previous month.

      //Determine the percent increase or decrease.

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      let currentMonthTotal = 0;
      let previousMonthTotal = 0;

      bookings.forEach((booking) => {
        const paidDate = new Date(booking.paidAt);

        if (
          paidDate.getFullYear() === currentYear &&
          paidDate.getMonth() === currentMonth
        ) {
          currentMonthTotal += booking.totalPayment;
        }

        if (
          paidDate.getFullYear() === previousYear &&
          paidDate.getMonth() === previousMonth
        ) {
          previousMonthTotal += booking.totalPayment;
        }
      });

      let percentageChange = 0;

      if (previousMonthTotal > 0) {
        percentageChange =
          ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      }

      res.status(200).json({
        vacantFlat: vacantFlat.length,
        activeGuests: activeGuests.length,
        newMessages: newMessages.length,
        currentMonthTotal,
        previousMonthTotal,
        percentageChange: percentageChange.toFixed(2) + "%", // Rounded to 2 decimal places
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },

  transactionStats: async (req, res) => {
    try {

      const { year } = req.query

      const expenses = await Expenses.find({
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      });
      const bookings = await Bookings.find({
        status: "completed",
        paidAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      });

      // Initialize an Object to hold Monthly data.

      const monthlyData = {};

      // helper function to extract month Short name.

      const getMonthName = (date) => {
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return monthNames[date.getMonth()];
      };

      //  process expense.

      expenses.forEach((expense) => {
        const month = getMonthName(expense.createdAt); // extract the month
        if (!monthlyData[month]) {
          monthlyData[month] = { Expense: 0, Income: 0 };
        }
        return (monthlyData[month].Expense += expense.amount);
      });

      // Process bookings
      bookings.forEach((booking) => {
        const month = getMonthName(booking.paidAt);
        if (!monthlyData[month]) {
          monthlyData[month] = { Expense: 0, Income: 0 };
        }
        monthlyData[month].Income += booking.totalPayment;
      });

      // Convert the monthlyData object into the desired array format

      const data = Object.keys(monthlyData).map((month) => ({
        name: month,
        Expense: monthlyData[month].Expense,
        Income: monthlyData[month].Income,
      }));

      // Sort the data by month
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      data.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));

       // Send the processed data as the response
    res.status(200).json(data);

    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },

  profilePieChart: async (req, res) => {
    try {
        let maleTotal = 0;
        let femaleTotal = 0;
        let undisclosedTotal = 0;

        // Fetch all bookings
        const bookings = await Bookings.find({});

        // Loop through bookings and count genders
        bookings.forEach(booking => {
            const gender = booking.contactInfo?.gender?.toLowerCase();

            if (gender === "male") {
                maleTotal++;
            } else if (gender === "female") {
                femaleTotal++;
            } else {
                undisclosedTotal++;
            }
        });

        // Construct the response data
        const data = [
            { name: "Male", value: maleTotal },
            { name: "Female", value: femaleTotal },
            { name: "Undisclosed", value: undisclosedTotal }
        ];

        // Send response
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
}

};
