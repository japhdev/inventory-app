from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection


# Create the main FastAPI application instance.
# This object represents the API server where routes,
# middleware, and backend configurations will be defined.
app = FastAPI()

"""
Configure the CORS (Cross-Origin Resource Sharing) middleware.

This middleware allows external applications (for example,
a frontend application running in React) to communicate with this API.

In this configuration only requests coming from:
http://localhost:3000 are allowed. This is typically the frontend development server.

allow_origins: list of domains allowed to access the API.
allow_methods: allowed HTTP methods (GET, POST, PUT, DELETE, etc). "*" means all methods are allowed.
allow_headers: allowed HTTP headers in requests.
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
"""
Schema used to validate product data received from the client.

This model ensures that every product sent to the API
contains the required fields with the correct data types.

Fields:
- name: Product name.
- price: Product price as a decimal number.
- stock: Available quantity in inventory.
- category: Product category.
"""
class ProductoSchema(BaseModel):
    name: str
    price: float
    stock: int
    category: str

"""
GET /products

Retrieve all products stored in the database.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor that returns results as dictionaries.
3. Execute a SQL query to retrieve all records from the products table.
4. Fetch all results.
5. Close the cursor and database connection.
6. Return the list of products as JSON.
"""
@app.get("/products")
def get_products():

    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor that returns rows as dictionaries instead of tuples
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Execute SQL query to retrieve all products
    cursor.execute("SELECT * FROM products")

    # Fetch all rows from the query result
    products = cursor.fetchall()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return products as JSON response
    return products