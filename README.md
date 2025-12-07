# FullStack_BackEND

## Backend GitHub Repository Link:
https://github.com/maheen-y/FullStack_BackEND

## Link to Render.com route which returns all lessons: 
https://cst3144-school-app.onrender.com/lessons 

## Description
The backend is built using Express js and Node js and hosted on Render.com

Backend is connected to MongoDB Atlas using MongoDB's native driver 
The database consists 2 collections:
* lessons - contains lesson information such as subject, location, price and availability
* orders - stores order data when customer completes checkout form

Backend folder contains an env file which stores the MongoDB URI securely

Gitignore file is used to prevent the node modules folder and env file from being uploaded to the GitHub repository

The server.js file implements the REST API which includes the following requests
* GET/lessons - returns all lessons as json
* POST/orders - new order is saved into the orders collection
* PUT/lessons/:id - the lesson attributes are updated

The Express js server also includes middleware: 
* logger - this is used to output requests and contains a timestamp
* static file for images - returns lesson images from /static/images
* error handling - error message in Json is displayed if image file does not exist
