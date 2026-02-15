const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(" Connected to MongoDB");
        app.listen(PORT, () => console.log(` Server spinning on port ${PORT}`));
    })
    .catch(err => console.error(" DB Connection Error:", err));