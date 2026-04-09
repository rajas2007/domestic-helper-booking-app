const { createBooking } = require('../models/bookingModel');

const bookService = async (req, res) => {
  try {
    const { service_id, user_id } = req.body;

    const booking = await createBooking(service_id, user_id);

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error booking service" });
  }
};

module.exports = { bookService };