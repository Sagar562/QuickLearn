A full-stack online learning platform where students can purchase and enroll in courses, instructors can create and manage courses, and admins can categorize and manage courses. This project is built with a Node.js backend, using essential technologies like NodeMailer, OTP Generator, bcrypt, JWT Tokens, and Razorpay for secure payment processing.

## Features ##
User Roles:

Student: Can browse, purchase, and enroll in courses.
Instructor: Can create, manage, and update courses.
Admin: Manages the categories for courses and oversees platform operations.
Course Management:

Instructors can create courses with details like course name, description, and pricing.
Students can browse available courses, purchase them, and enroll to access course materials.
User Authentication:

JWT Authentication: Secure login and registration with JWT tokens for session management.
Email Verification: Email verification using NodeMailer.
OTP Verification: For password resets or account recovery via OTP Generator.
Course Categories:

Admin can create and manage categories for courses, making it easier to classify and organize the courses.
Payment Integration:

Razorpay integration for processing payments when students purchase courses.


## Technologies Used ##

Backend: Node.js with Express.js for the RESTful API.
Database: MongoDB to store user data, courses, and enrollment details.
Authentication:
JWT Tokens for user authentication and authorization.
bcrypt for securely hashing user passwords.
NodeMailer for sending emails (e.g., verification emails, notifications).
OTP Generator for secure OTP generation during password reset or email verification.
Payment Gateway:
Razorpay for handling online payments when students purchase courses.
API Security: Middleware for handling JWT token validation and user access control based on roles (Student, Instructor, Admin).


## Razorpay Payment Integration ##
Razorpay is integrated into this platform to handle payments securely when students purchase courses. Here's how it works:

Student initiates the payment: After a student selects a course to purchase, the payment process begins.
Create Payment Order: A backend request is made to Razorpay to create an order with the price of the course.
Frontend Razorpay Checkout: The Razorpay checkout form is displayed to the student, where they can enter payment details.
Payment Verification: Upon successful payment, Razorpay sends a payment verification request to the backend.
Confirmation & Enrollment: If the payment is successful, the student is enrolled in the course.
