from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection
import psycopg2
import psycopg2.extras


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
- is_active: Indicates whether the product is active in the inventory system.
"""
class ProductSchema(BaseModel):
    name: str
    price: float
    stock: int
    category: str
    is_active: bool = True

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

"""
POST /products

Create a new product in the database.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor to execute the SQL query.
3. Execute an INSERT query to add the product with name, price, stock, and category.
4. Commit the transaction to save the changes.
5. Close the cursor and database connection.
6. Return a success message.
"""
@app.post("/products")
def create_product(product: ProductSchema):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    is_active = product.stock > 0

    # Execute INSERT query to add the product with name, price, stock, and category
    cursor.execute(
        "INSERT INTO products (name, price, stock, category, is_active) VALUES (%s, %s, %s, %s, %s)",
        (product.name, product.price, product.stock, product.category, is_active)
    )

    # Commit the transaction to save the changes to the database
    conn.commit()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return success message as JSON response
    return {"message": "Product created successfully"}

"""
PUT /products/{id}

Update an existing product in the database.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor to execute the SQL query.
3. Determine the product status (is_active). A product is considered active when its stock is greater than 0.
4. Execute an UPDATE query to modify the product with the given id using name, price, stock, and category.
5. Commit the transaction to save the changes.
6. Close the cursor and database connection.
7. Return a success message.
"""
@app.put("/products/{id}")
def update_product(id: int, product: ProductSchema):
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    # Determine if the product should be active.
    # Products with stock greater than 0 are considered active.
    is_active = product.stock > 0

    # Execute UPDATE query to modify the product with the given id
    cursor.execute(
        "UPDATE products SET name=%s, price=%s, stock=%s, category=%s, is_active=%s WHERE id=%s",
        (product.name, product.price, product.stock, product.category, is_active, id)
    )

    # Commit the transaction to save the changes to the database
    conn.commit()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return success message as JSON response
    return {"message": "Product updated successfully"}


"""
DELETE /products/{id}

Remove a product from the database by its ID.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor to execute the SQL query.
3. Execute a DELETE query targeting the product with the specified id.
4. Commit the transaction to apply the deletion.
5. Close the cursor and database connection.
6. Return a success message.
"""
@app.delete("/products/{id}")
def delete_product(id: int):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    # Execute DELETE query for the product with the given id
    cursor.execute("DELETE FROM products WHERE id=%s", (id,))

    # Commit the transaction to remove the product
    conn.commit()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

"""
PUT /products/{id}/sell

Discount stock when a product is sold.

Process:
1. Establish a connection to the PostgreSQL database.
2. Check if the product exists.
3. Verify there is enough stock.
4. Subtract the sold quantity and update is_active accordingly.
5. Commit the transaction.
6. Return a success message.
"""
@app.put("/products/{id}/sell")
def sell_product(id: int, quantity: int):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Check if product exists and get current stock
    cursor.execute("SELECT stock FROM products WHERE id=%s", (id,))
    product = cursor.fetchone()

    if not product:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    if product["stock"] < quantity:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Not enough stock")

    new_stock = product["stock"] - quantity
    is_active = new_stock > 0

    cursor.execute(
        "UPDATE products SET stock=%s, is_active=%s WHERE id=%s",
        (new_stock, is_active, id)
    )
    conn.commit()
    cursor.close()
    conn.close()


    # Return success message as JSON response
    return {"message": "Product deleted successfully"}