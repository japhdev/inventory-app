from math import prod

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection
from auth import hash_password, verify_password, create_access_token, decode_token
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

class ProductSchema(BaseModel):
    """
    Schema used to validate product data received from the client.

    This model ensures that every product sent to the API
    contains the required fields with the correct data types.

    Fields:
        name      (str):   Product name.
        price     (float): Product price as a decimal number.
        stock     (int):   Available quantity in inventory.
        category  (str):   Product category.
        sku       (str):   Stock Keeping Unit
        is_active (bool):  Indicates whether the product is active. Defaults to True.
    """
    name: str
    price: float
    stock: int
    category: str
    sku: str
    is_active: bool = True


class UserRegisterSchema(BaseModel):
    """
    Schema used to validate user registration data received from the client.

    Fields:
        username (str): Unique display name chosen by the user.
        email    (str): User's email address. Used as login identifier.
        password (str): Plain text password. It will be hashed before storage.
    """
    username: str
    email: str
    password: str


class UserLoginSchema(BaseModel):
    """
    Schema used to validate login credentials received from the client.

    Fields:
        email    (str): Registered email address of the user.
        password (str): Plain text password to verify against the stored hash.
    """
    email: str
    password: str

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
3. Determine the product status (is_active). A product is considered active when its stock is greater than 0.
4. Execute an INSERT query to add the product with name, price, stock, category and sku.
5. Commit the transaction to save the changes.
6. If the SKU already exists, roll back the transaction and return a 400 error.
7. Close the cursor and database connection.
8. Return a success message.

Raises:
    HTTPException 400: If the SKU already exists in the database (enforced by a unique constraint at the database level).
"""
@app.post("/products")
def create_product(product: ProductSchema):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    # Determine if the product should be active.
    # Products with stock greater than 0 are considered active.
    is_active = product.stock > 0

    try:
        # Execute INSERT query to add the product with name, price, stock, category and sku
        cursor.execute(
            "INSERT INTO products (name, price, stock, category, sku, is_active) VALUES (%s, %s, %s, %s, %s, %s)",
            (product.name, product.price, product.stock, product.category, product.sku, is_active)
        )

        # Commit the transaction to save the changes to the database
        conn.commit()

    except Exception:
        # Roll back the transaction if the SKU already exists
        conn.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists")

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
4. Execute an UPDATE query to modify the product with the given id using name, price, stock, category and sku.
5. Commit the transaction to save the changes.
6. If the SKU already exists, roll back the transaction and return a 400 error.
7. Close the cursor and database connection.
8. Return a success message.

Raises:
    HTTPException 400: If the updated SKU already belongs to another product (enforced by a unique constraint at the database level).
"""
@app.put("/products/{id}")
def update_product(id: int, product: ProductSchema):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    # Determine if the product should be active.
    # Products with stock greater than 0 are considered active.
    is_active = product.stock > 0

    try:
        # Execute UPDATE query to modify the product with the given id
        cursor.execute(
            "UPDATE products SET name=%s, price=%s, stock=%s, category=%s, sku=%s, is_active=%s WHERE id=%s",
            (product.name, product.price, product.stock, product.category, product.sku, is_active, id)
        )

        # Commit the transaction to save the changes to the database
        conn.commit()

    except Exception:
        # Roll back the transaction if the SKU already belongs to another product
        conn.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists")

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

    return {"message": "Product deleted successfully"}

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

    # Execute SQL query to retrieve the product by its ID
    cursor.execute("SELECT * FROM products WHERE id=%s", (id,))
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

    # Update stock
    cursor.execute(
        "UPDATE products SET stock=%s, is_active=%s WHERE id=%s",
        (new_stock, is_active, id)
    )

    # Save sale to history
    cursor.execute(
        "INSERT INTO sales (product_id, product_name, quantity, price_at_sale) VALUES (%s, %s, %s, %s)",
        (id, product["name"], quantity, product["price"])
    )

    conn.commit()
    cursor.close()
    conn.close()

    # Return success message as JSON response
    return {"message": "Sale registered successfully"}

"""
POST /register

Register a new user in the system.

Process:
1. Establish a connection to the PostgreSQL database.
2. Check if the email is already registered to avoid duplicates.
3. Hash the plain text password using bcrypt before storing it.
4. Insert the new user (username, email, hashed password) into the database.
5. Commit the transaction and close the connection.
6. Return a success message.

Raises:
    HTTPException 400: If the email is already registered.
"""
@app.post("/register")
def register(user: UserRegisterSchema):
    conn = get_connection()
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email=%s", (user.email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password before saving — never store plain text passwords
    password_hash = hash_password(user.password)

    cursor.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
        (user.username, user.email, password_hash)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "User registered successfully"}


"""
POST /login

Authenticate a user and return a JWT access token.

Process:
1. Establish a connection to the PostgreSQL database.
2. Search for the user by email address.
3. Verify the submitted password matches the stored hash.
4. If valid, generate a signed JWT token containing email and username.
5. Return the token along with token type and username.

Raises:
    HTTPException 401: If the email does not exist or the password is incorrect.
                    Both cases return the same message to avoid revealing
                    which field is wrong (security best practice).
"""
@app.post("/login")
def login(user: UserLoginSchema):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Find user by email
    cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
    db_user = cursor.fetchone()
    cursor.close()
    conn.close()

    # Verify user exists and password is correct
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate JWT token
    token = create_access_token({"sub": db_user["email"], "username": db_user["username"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user["username"]
    }

"""
GET /categories

Retrieve all categories stored in the database, sorted alphabetically.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor that returns results as dictionaries.
3. Execute a SQL query to retrieve all records from the categories table, ordered by name in ascending order.
4. Fetch all results.
5. Close the cursor and database connection.
6. Return the list of categories as JSON.
"""
@app.get("/categories")
def get_categories():
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor that returns rows as dictionaries instead of tuples
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Execute SQL query to retrieve all categories sorted alphabetically
    cursor.execute("SELECT * FROM categories ORDER BY name")

    # Fetch all rows from the query result
    categories = cursor.fetchall()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return categories as JSON response
    return categories

"""
POST /categories

Create a new category in the database.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor to execute the SQL query.
3. Execute an INSERT query to add the new category using the provided name.
4. Commit the transaction to save the changes.
5. Close the cursor and database connection.
6. Return a success message.

Raises:
    HTTPException 400: If the category name already exists in the database
    (enforced by a unique constraint at the database level).
"""
@app.post("/categories")
def create_category(category: dict):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    try:
        # Execute INSERT query to add the new category
        cursor.execute(
            "INSERT INTO categories (name) VALUES (%s)",
            (category["name"],)
        )

        # Commit the transaction to save the changes to the database
        conn.commit()
    except Exception:
        # Roll back the transaction if an error occurs (e.g. duplicate name)
        conn.rollback()
        raise HTTPException(status_code=400, detail="Category already exists")

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return success message as JSON response
    return {"message": "Category created successfully"}

"""
DELETE /categories/{id}

Remove a category from the database by its ID.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor to execute the SQL query.
3. Execute a DELETE query targeting the category with the specified id.
4. Commit the transaction to apply the deletion.
5. Close the cursor and database connection.
6. Return a success message.
"""
@app.delete("/categories/{id}")
def delete_category(id: int):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor to execute the SQL query
    cursor = conn.cursor()

    # Execute DELETE query for the category with the given id
    cursor.execute("DELETE FROM categories WHERE id=%s", (id,))

    # Commit the transaction to remove the category
    conn.commit()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return success message as JSON response
    return {"message": "Category deleted successfully"}

"""
GET /sales

Retrieve all sales records from the database, ordered by date (most recent first)

Process:
1. Establish a connection to the PostgreSQL data base.
2. Create a cursor with RalDictCursor to return rows as dictionaries.
3. Execute a SELECT query to fetch all sales order by sold_at DESC.
4. Fetch all resulting rows. 
5. Close the cursor and database connection.
6. Return the list of sale as a JSON response.


"""
@app.get("/sales")
def get_sales():
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor that returns rows as dictionaries instead of tuples
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Execute SELECT query to fetch all sales ordered by most recent first
    cursor.execute("""
        SELECT * FROM sales
        ORDER BY sold_at DESC
    """)

    # Fetch all rows from the query result
    sales = cursor.fetchall()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return the list of sales as a JSON response
    return sales

"""
GET /sales/product/{product_id}

Retrieve all sales records associated with a specific product by its ID.

Process:
1. Establish a connection to the PostgreSQL database.
2. Create a cursor with RealDictCursor to return rows as dictionaries.
3. Execute a SELECT query filtering sales by product_id, ordered by sold_at DESC.
4. Fetch all resulting rows.
5. Close the cursor and database connection.
6. Return the list of sales for that product as a JSON response.
"""
@app.get("/sales/product/{product_id}")
def get_product_sales(product_id: int):
    # Open a new connection to the PostgreSQL database
    conn = get_connection()

    # Create a cursor that returns rows as dictionaries instead of tuples
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Execute SELECT query filtering by product_id, ordered by most recent first
    cursor.execute("""
    SELECT * FROM sales
    WHERE product_id = %s
    ORDER BY sold_at DESC
""", (product_id,))
    
    # Fetch all rows from the query result
    sales = cursor.fetchall()

    # Close cursor and connection to release resources
    cursor.close()
    conn.close()

    # Return the list of sales for the given product as a JSON response
    return sales