const contactService = require('./contact.service');

const createContactEntry = async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;
        console.log("📥 Incoming Enquiry Data from Frontend:", req.body);

        if (!name || !phone || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                error: "All fields (name, phone, email, message) are required." 
            });
        }

        const result = await contactService.processContactMessage({ name, phone, email, message });

        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

module.exports = {
    createContactEntry
};
