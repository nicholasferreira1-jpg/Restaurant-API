// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const port = 3000;
const {body, validationResult} = require('express-validator');

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

function requestLogger (req,res,next) {
    //Creates a timestamp for when the request was made 
    const timestamp = new Date().toISOString();
    //Logging the HTTP method (GET, POST, PUT, DELETE) and URL
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

    //  POST and PUT requests, logs the request body so you can see what data was sent
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }

    // Pass control to next middleware
    next();
}

// Built-in middleware for parsing JSON
app.use(express.json());

// Custom Logging middleware
// It comes after express.json() because we want to log the parsed request body,
//  not the raw data. Order is important here!
app.use(requestLogger);


const todoValidation = [
    body('name')
        .isLength({ min: 3})
        .withMessage('Name must be at least three characters long'),
    body('description')
        .isLength({ min: 10})
        .withMessage('Description must be at least ten characters long'),
    body('price')
      .notEmpty()
      .withMessage('Price is required')
    	.isFloat({min: 0.01}) 
      .withMessage('Price must be greater than 0'),
    body('category')
        .isIn(["appetizer", "entree", "dessert", "beverage"])
        .withMessage('Category must be "appetizer", "entree", "dessert", "beverage"'),
    body('ingredients')
        .isArray({ min: 1 })
        .withMessage('There must be at least one ingredient'), 
    body('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be true or false')   
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }
  
    // Set default value for completed if not provided
    if (req.body.completed === undefined) {
        req.body.completed = false;
    }
  
    next();
};


// Define routes and implement middleware here

app.get('/api/menuItems', (req, res) => {
    res.json(menuItems);
});

app.get('/api/menuItems/:id', (req, res) => {
    const menuItemId = parseInt(req.params.id);
    const menuItem = menuItems.find(t => t.id === menuItemId);
    
    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404).json({ error: 'MenuItem not found' });
    }
});

app.post('/api/menuItems', todoValidation, handleValidationErrors, (req, res) => {
    const { name, description, price, category, ingredients } = req.body;
  
    const newMenuItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category,
        ingredients,
        available: false,
  
    };
  
    menuItems.push(newMenuItem);
    res.status(201).json(newMenuItem);
});

app.put('/api/menuItems/:id', todoValidation, handleValidationErrors, (req, res) => {
    const menuItemId = parseInt(req.params.id);
    const { name, description, price, available, category, ingredients } = req.body;
    
    const menuItemIndex = menuItems.findIndex(t => t.id === menuItemId);
    
    if (menuItemIndex === -1) {
        return res.status(404).json({ error: 'MenuItem not found' });
    }
    
    menuItems[menuItemIndex] = {
        id: menuItemId,
        name,
        description,
        price,
        category,
        ingredients,
        available,
    };
    
    res.json(menuItems[menuItemIndex]);
});

app.delete('/api/menuItems/:id', (req, res) => {
    const menuItemId = parseInt(req.params.id);
    const menuItemIndex = menuItems.findIndex(t => t.id === menuItemId);
    
    if (menuItemIndex === -1) {
        return res.status(404).json({ error: 'MenuItem not found' });
    }
    
    const deletedMenuItem = menuItems.splice(menuItemIndex, 1)[0];
    res.json({ message: 'MenuItem deleted', menuItem: deletedMenuItem });
});

app.listen(port, () => {
    console.log(`MenuItem API running at http://localhost:${port}`);
});

