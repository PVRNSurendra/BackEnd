const mongoose = require('mongoose');

// Connect to MongoDB
async function main() {
    await mongoose.connect('mongodb://localhost:27017/Rents');
    console.log('Connected to MongoDB');
}

main().catch(err => console.log(err));

// Define the login schema
let loginSchema = mongoose.Schema({
    Mail: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    } 
});

// Define the property schema
const propertySchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String
});

// Create models
let logs = mongoose.model("login", loginSchema);
let Property = mongoose.model('Property', propertySchema);

// Export both models
module.exports = {
    Property,
    logs
};
