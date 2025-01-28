const { DateFormatter } = require("./helpers");

const emailHeader = (title) => {
  return `
 <!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>${title}</title>
    <meta name="description" content="Email From Data-Actions .">
    <style type="text/css">
        a:hover {
            text-decoration: underline !important;
        }
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!-- 100% body table -->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:25px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>

                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1
                                            style="color:#1e1e2d; font-weight:500; margin:0;font-size:20px;font-family:'Rubik',sans-serif;">
                                            ${title}
                                        </h1>
      `;
};

const emailFooter = () => {
  return `
       <p
                                            style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
                                            Best Regards
                                        </p>
                                        <p
                                            style="color:#455056; font-size:14px;line-height:24px; margin-top:10px; text-align: left;">
                                             <img style="width: 40px;" src=${process.env.FRONTEND_BASE_URL}/logo.png alt="Logo" />
                                            <br>
                                            <strong>Customer Support</strong> 
                                            <br>
                                            exapsuites@gmail.com | +234-8034246152, +234-8098751502
                                        </p>
                                        
                                    </td>
                                </tr>

                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p
                                style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                Copyright; <strong>Exapsuites</strong> </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p
                                style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                <a href="https://exapsuites.com/unsubscribe" target='_blank'>Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:25px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>
  
      `;
};

module.exports = {
  BookingSuccessTemplate: (user, booking) => {
    return `
       ${emailHeader("Apartment Reservation")}

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
           Dear ${user.firstName} ${user.lastName},
       </p>
         <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
         Thank you for your interest in our exclusive apartments. We're excited that among all options you choose our facility for your vacation:
         </p>

         <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
          Find below the details of your reservation.
         </p>
         
           <ul style=" margin: 0; text-align: left; list-style: none;">
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Apartment:</span>
                    <span> ${booking.apartmentId.title} </span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Total Rooms:</span>
                    <span>${booking.apartmentId.totalRooms} </span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Booking Status:</span>
                    <span style="background-color: green; color: #fff; padding: 4px; width: fit-content;">Confirmed</span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Check In Date:</span>
                    <span>${DateFormatter(booking.startDate)}</span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Check Out Date:</span>
                    <span>${DateFormatter(booking.endDate)}</span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Amount Paid:</span>
                    <span>₦${booking.totalPrice}</span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Payment Invoice:</span>
                    <span>#${booking.invoice}</span>
                 </li>
                                                                      
          </ul>
      <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
        For More Information, you can contact our call center or meet our customer experience manager at the reception, Cheers 🌻
      </p>

        ${emailFooter()}
     `;
  },


  CheckOutEmailTemplate: (user) => {
    return `
       ${emailHeader("Check Out Update")}

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
           Dear ${user.name},
       </p>

       <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
        Thank you for your interest in our training program! To proceed, kindly send your CV to info@dataactions.com so we can assess your experience and align the program with your goals.
        </p>

       <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
        If you have any questions, feel free to contact us on WhatsApp at +44 7742 088843.
        </p>

       <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
          We’re excited to support your growth and look forward to assisting you every step of the way!
        </p>
       
        ${emailFooter()}
     `;
  },


  ContactMessageEmailTemplate: (user) => {
    return `
       ${emailHeader("Message Recived")}

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
           Dear ${user.name},
       </p>

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
        Thank you for reaching out to us. We’ve received your message and will respond as soon as possible.
        </p>
        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
        Our team is committed to providing prompt and helpful support to address your questions or concerns. If your inquiry is urgent, please feel free to contact us directly via WhatsApp at +44 7742 088843.
        </p>
        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
          We appreciate your patience and look forward to assisting you shortly.
        </p>

        ${emailFooter()}
     `;
  },
  AdminEmailTemplate: (actionTaken) => {
    return `
       ${emailHeader("New Notification from Exapsuites")}

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
           Dear Sir,
       </p>

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
         ${actionTaken}
        </p>

        ${emailFooter()}
     `;
  },
};
