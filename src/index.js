const express = require("express");
const { Property, logs } = require('./modals/mongo');

const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const multer = require('multer');
app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));
const path = require('path');

const houses = [
    { id: 1, location: 'Guntur', imageUrl: '/houseimage.jpg', description: '3BHK Villa', price: '₹15,000/month' },
    { id: 2, location: 'Hyderabad', imageUrl: '/house2.jpg', description: '2BHK Apartment', price: '₹18,000/month'  },
    { id: 3, location: 'Guntur', imageUrl: '/h1.jpg', description: '4BHK House', price: '₹25,000/month'  },
    { id: 4, location: 'Guntur', imageUrl: '/h2.jpeg', description: '2BHK House', price: '₹14,000/month'  },
    { id: 5, location: 'Guntur', imageUrl: '/h3.jpeg', description: '2BHK House', price: '₹13,000/month'  },
    { id: 6, location: 'Guntur', imageUrl: '/h4.jpeg', description: '1BHK House', price: '₹10,000/month'  },
    { id: 7, location: 'Hyderabad', imageUrl: '/h5.jpeg', description: '2BHK House', price: '₹17,000/month'  },
    { id: 8, location: 'Hyderabad', imageUrl: '/h6.jpeg', description: '2BHK House', price: '₹13,000/month'  },
    { id: 9, location: 'Hyderabad', imageUrl: '/h7.jpeg', description: '2BHK House', price: '₹16,000/month'  },
    { id: 10, location: 'Hyderabad', imageUrl: '/h8.jpeg', description: '4BHK House', price: '₹28,000/month'  },
    { id: 11, location: 'Guntur', imageUrl: '/h9.jpeg', description: '2BHK House', price: '₹16,000/month'  },
    { id: 12, location: 'Hyderabad', imageUrl: '/h10.jpeg', description: '2BHK House', price: '₹12,000/month'  },
    { id: 13, location: 'Guntur', imageUrl: '/h11.jpeg', description: '2BHK House', price: '₹11,000/month'  },
];

app.get("/", (req, res) => {
    const username = req.session.user ? req.session.user.username : undefined;
    res.render("dashboard", { username: username });
});

app.get("/home", (req, res) => {
    const username = req.session.user ? req.session.user.username : undefined;
    res.render("home", { username: username });
});

app.get("/login", (req, res) => {
    // Check if user is already logged in (assuming session holds the username)
    const username = req.session.user ? req.session.user.username : null;  // Assuming username is stored in session
    res.render("login", { username: username || null });  // Pass username if it exists
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await logs.findOne({ Mail: email });
        if (!user) {
            return res.send('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.send('Invalid email or password.');
        }

        // Store username in session
        req.session.user = { username: user.Name };  // This stores the username in the session
        res.redirect('/home');
    } catch (error) {
        console.error("Error during login:", error);
        res.send("An error occurred during login.");
    }
});

app.get('/signup', (req, res) => {
    const username = req.session.user ? req.session.user.username : undefined;
    res.render('signup', { username: username });
});



app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { username: req.session.user.username });
});

// Search page
app.get('/search', (req, res) => {
    const username = req.session.user ? req.session.user.username : undefined;
    res.render('search',{ username: username });
});

app.post('/search', (req, res) => {
    const location = req.body.location ? req.body.location.toLowerCase() : '';

    // Filter the houses based on the provided location
    const filteredHouses = houses.filter(house => house.location.toLowerCase() === location);

    // Render the 'houses' view with filtered results or send a message if no matches found
    if (filteredHouses.length > 0) {
        const username = req.session.user ? req.session.user.username : null;  // Assuming username is stored in session
        res.render('houses', { houses: filteredHouses, username: username || null  });
    } else {
        res.render('houses', { houses: [], message: "No houses available for the specified location." });
    }
});


app.get('/list-property', (req, res) => {
    const username = req.session.user ? req.session.user.username : undefined;
    res.render('list-property', { username: username });
});

const upload = multer({
    dest: path.join(__dirname, 'public/uploads/')
});
app.post('/list-property', upload.single('pimage'), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : ''; // Store the file path

        // Create a new Property instance
        const property = new Property({
            title,
            description,
            price,
            imageUrl
        });

        await property.save();

        res.send('Property saved successfully');
    } catch (error) {
        console.error('Error saving property:', error);
        res.status(500).send('Error saving property');
    }
});

app.get('/allUsers', async (req, res) => {
    try {
        const allUsers = await logs.find();
        res.render('Users', { allUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.send("An error occurred fetching users.");
    }
});

app.get('/about',(req,res)=>{
    const username = req.user ? req.user.username : null; // or any logic to get the username, such as from a session or auth system
    res.render('About', { username });
})

app.get('/terms',(req,res)=>{
    const username = req.user ? req.user.username : null; // or your preferred way of fetching the username
    res.render('Terms', { username });
})

app.get('/privacy',(req,res)=>{
    const username = req.user ? req.user.username : null; // or your preferred way of fetching the username
    res.render('Privacy', { username });
})

app.get('/contact', (req, res) => {
    const username = req.user ? req.user.username : null; // or your preferred way of fetching the username
    res.render('Contact', { username });
});


app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
