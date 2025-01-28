
const transporter = require("../utils/emailServer");
const { ConsultationBookingEmailTemplate, TrainingRegistrationSuccess, TrainingPayment, ContactMessageEmailTemplate, AdminEmailTemplate, BookingSuccessTemplate } = require("./emailTemplate");

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

  // ConsultationBookingSuccess: async (user) => {
  //   try {

  //     const mailOptions = {
  //       from: `"Data Actions" <${process.env.SUPPORT_EMAIL}>'`,
  //       to: `${user.email}`,
  //       subject: "Your Consultation Request",
  //       html: ConsultationBookingEmailTemplate(user),
  //       headers: {
  //         "List-Unsubscribe":
  //           "<https://dataactions.com/unsubscribe>, <mailto:unsubscribe@dataactions.com>",
  //       },
  //     };

  //     await transporter.sendMail(mailOptions);
  //     console.log('Email Sent')
  //   } catch (err) {
  //     console.log(err)
  //   }
  // },

  // TrainingRegisteration: async (user) => {
  //   try {

  //     const mailOptions = {
  //       from: `"Data Actions" <${process.env.SUPPORT_EMAIL}>'`,
  //       to: `${user.email}`,
  //       subject: "Course Enrollment Next Step",
  //       html: TrainingRegistrationSuccess(user),
  //       headers: {
  //         "List-Unsubscribe":
  //           "<https://dataactions.com/unsubscribe>, <mailto:unsubscribe@dataactions.com>",
  //       },
  //     };

  //     await transporter.sendMail(mailOptions);
  //     console.log('Email Sent')
  //   } catch (err) {
  //     console.log(err)
  //   }
  // },

  // TrainingPaymentSuccess: async (user) => {
  //   try {

  //     const mailOptions = {
  //       from: `"Data Actions" <${process.env.SUPPORT_EMAIL}>'`,
  //       to: `${user.email}`,
  //       subject: "Training registration",
  //       html: TrainingPayment(user),
  //       headers: {
  //         "List-Unsubscribe":
  //           "<https://dataactions.com/unsubscribe>, <mailto:unsubscribe@dataactions.com>",
  //       },
  //     };

  //     await transporter.sendMail(mailOptions);
  //     console.log('Email Sent')
  //   } catch (err) {
  //     console.log(err)
  //   }
  // },
  // ContactMessageEmail: async (user) => {
  //   try {

  //     const mailOptions = {
  //       from: `"Data Actions" <${process.env.SUPPORT_EMAIL}>'`,
  //       to: `${user.email}`,
  //       subject: "We've Received Your Message",
  //       html: ContactMessageEmailTemplate(user),
  //       headers: {
  //         "List-Unsubscribe":
  //           "<https://dataactions.com/unsubscribe>, <mailto:unsubscribe@dataactions.com>",
  //       },
  //     };

  //     await transporter.sendMail(mailOptions);
  //     console.log('Email Sent')
  //   } catch (err) {
  //     console.log(err)
  //   }
  // },
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

};
