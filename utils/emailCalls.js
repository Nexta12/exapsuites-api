
const transporter = require("../utils/emailServer");
const { ConsultationBookingEmailTemplate, TrainingRegistrationSuccess, TrainingPayment, ContactMessageEmailTemplate, AdminEmailTemplate, BookingSuccessTemplate, ForgotPasswordTemplate } = require("./emailTemplate");

module.exports = {

  BookingSuccessEmail: async (user, booking) => {
    try {

      const mailOptions = {
        from: `"Exapsuites" <${process.env.USER_EMAIL}>`,
        to: `${user.email}`,
        subject: "Apartment Reservation Details",
        html: BookingSuccessTemplate(user, booking),
        headers: {
          "List-Unsubscribe":
            "<https://exapsuites.com/unsubscribe>, <mailto:unsubscribe@exapsuites.com>",
        },
      };

      await transporter.sendMail(mailOptions);
      console.log('Email Sent')
    } catch (err) {
      console.log(err)
    }
  },

 
  AdminMessageEmail: async (actionTaken) => {
    try {

      const mailOptions = {
        from: `"Exapsuites" <${process.env.USER_EMAIL}>`,
        to: process.env.AdminEmail,
        subject: "Notification from Exapsuites",
        html: AdminEmailTemplate(actionTaken),
        headers: {
          "List-Unsubscribe":
            "<https://exapsuites.com/unsubscribe>, <mailto:unsubscribe@exapsuites.com>",
        },
      };

      await transporter.sendMail(mailOptions);
      console.log('Email Sent')
    } catch (err) {
      console.log(err)
    }
  },

  ForgotPasswordEmail: async (otp, email) => {
    try {

      const mailOptions = {
        from: `"Exapsuites" <${process.env.USER_EMAIL}>`,
        to: email,
        subject: "Password Reset OTP",
        html: ForgotPasswordTemplate(otp),
        headers: {
          "List-Unsubscribe":
            "<https://exapsuites.com/unsubscribe>, <mailto:unsubscribe@exapsuites.com>",
        },
      };

      await transporter.sendMail(mailOptions);
      console.log('Email Sent')
    } catch (err) {
      console.log(err)
    }
  },

};
