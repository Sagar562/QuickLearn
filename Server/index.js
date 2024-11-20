const express = require('express');
const app = express();

//get Routes
const userRoutes = require('./routes/UserRoutes');
const profileRoutes = require('./routes/ProfileRoutes');
const courseRoutes = require('./routes/CourseRoutes');
const paymentRoutes = require('./routes/PaymentsRoutes');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { cloudinaryConnect } =  require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 4000;

//DATABAE CONNECT
database.connect();

//MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(
    cors ({
        origin : 'http://localhost:3000',
        credentials : true,
    })
)
app.use(
    fileUpload ({
        useTempFiles : true,
        tempFileDir : '/tmp',
    })
)

//CLOUDINARY CONNECT   
cloudinaryConnect();

//mounting routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);


//default route
app.get('/', (req, res) => {
    return res.json({
        success : true,
        message : 'default route running'
    })
})

//activate the server
app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
})