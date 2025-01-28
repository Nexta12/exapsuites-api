const slugify = require('slugify')
exports.getSnippet = (text, wordLimit) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) {
      return text;
    }
    return words.slice(0, wordLimit).join(' ');
  };
  
 
module.exports.generateSlug = async (title, Model) => {
  try {
    // Generate the initial slug
    let slug = slugify(title.trim(), { lower: true });

    // Check for existing documents with the same slug and generate a unique slug if necessary
    let slugExists = await Model.findOne({ slug });

    let uniqueIdentifier = 1;
    while (slugExists) {
      slug = `${slugify(title.trim(), { lower: true })}-${uniqueIdentifier}`;
      slugExists = await Model.findOne({ slug });
      uniqueIdentifier += 1;
    }

    return slug;
  } catch (error) {
    console.error("Error generating slug:", error);
    throw new Error("Slug generation failed");
  }
};

// generate Invoice Number
exports.generateInvoiceNumber = () => {
  const invoiceNo = Math.floor(100000 + Math.random() * 9000);
  return invoiceNo.toString();
};

exports.formatDateToDDMMYY = (isoDate) => {
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year.slice(-2)}`;
};

exports.validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}$/;
  return phoneRegex.test(phoneNumber);
}

exports.validateEmail = (email) => {
  const validEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return validEmail.test(email);
}

exports.generateInvoice = () => {
  const invoiceNo = Math.floor(100000 + Math.random() * 9000);
  return invoiceNo.toString();
};

exports.DateFormatter = (value) => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    // Format the date as DD/MM/YY
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  }

  return String(value);
};
