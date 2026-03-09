"""
Authentication and Security Module.

This module handles everything related to:

- Password encryption using bcrypt
- JWT token creation and validation
- Route protection through access tokens

Required dependencies:
    pip install python-jose passlib bcrypt python-dotenv
"""
import bcrypt
import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt


# Secret key used to sign JWT tokens.
# This key should be stored securely in the environment variables.
# You can generate a secure key using the following command in your terminal:
#
# python -c "import secrets; print(secrets.token_hex(32))"
#
# Example in .env file:
# SECRET_KEY=your_generated_secret_key_here
SECRET_KEY = os.getenv("SECRET_KEY")

# Cryptographic algorithm used to sign the token.
# HS256 = HMAC with SHA-256. this is the most widely used standard for JWT.
ALGORITHM = "HS256"

# Access token lifetime expressed in minutes.
# After 30 minutes, the token expires and the user must authenticate again.
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# bcrypt is used directly (without passlib) to hash and verify passwords.
#
#   bcrypt.hashpw()  → Hashes a password using the bcrypt algorithm.
#                      bcrypt is intentionally slow, which makes brute-force
#                      attacks significantly harder.
#
#   bcrypt.gensalt() → Generates a random salt each time, ensuring that
#                      the same password produces a different hash every time.
#
#   .encode("utf-8") → bcrypt requires bytes, not strings.
#                      encode() converts the string to bytes before hashing.
#
#   .decode("utf-8") → Converts the resulting bytes back to a string
#                      so it can be stored in the database.
def hash_password(password: str) -> str:
    """
    Generates a secure hash from a plain text password using bcrypt.

    This function is used when REGISTERING a new user.
    The original password is never stored in the database,
    only the resulting hash.

    Args:
        password (str): Plain text password. Ex: "myPassword123"

    Returns:
        str: Hashed password. Ex: "$2b$12$eW5K8V...xQz"

    Usage example:
        hashed = hash_password("myPassword123")
        # Store 'hashed' in the database, not the original password
    """
    # encode("utf-8") converts the string to bytes — required by bcrypt
    # gensalt() generates a unique random salt for each hash
    # decode("utf-8") converts the result back to string for database storage
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plain text password against its hashed version using bcrypt.

    This function is used during LOGIN.
    The hash is never decrypted; instead, bcrypt hashes the submitted
    password and compares it against the stored hash internally.

    Args:
        plain_password  (str): Password entered by the user at login.
        hashed_password (str): Hash stored in the database.

    Returns:
        bool: True if the password is correct, False otherwise.

    Usage example:
        is_valid = verify_password("myPassword123", hash_stored_in_db)
        if is_valid:
            # Grant access
    """
    # Both values must be encoded to bytes before bcrypt can compare them  
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

def create_access_token(data: dict) -> str:
    """
    Creates a signed JWT token containing the user's data.

    The token automatically includes an expiration time based on
    ACCESS_TOKEN_EXPIRE_MINUTES. This token is sent to the client
    (browser or mobile app) to be used in future requests.

    Args:
        data (dict): Data to include inside the token.
                    Usually contains the user identifier.
                    Ex: {"sub": "user@email.com"}

    Returns:
        str: Encoded and signed JWT token.
            Ex: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    Internal flow:
        1. The data dictionary is copied to avoid modifying the original.
        2. The exact expiration date/time is calculated (now + 30 minutes).
        3. The "exp" field is added to the dictionary (JWT recognizes it as expiration).
        4. The dictionary is encoded and signed with SECRET_KEY using HS256.

    Usage example:
        token = create_access_token({"sub": "user@email.com"})
        # Send 'token' to the client in the login response
    """
    # Copy the data to avoid modifying the original dictionary    
    to_encode = data.copy()

    # Calculate when the token expires: current time + 30 minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add the expiration time to the token payload
    # "exp" is a standard JWT field recognized automatically
    to_encode.update({"exp": expire})

    # Encode and sign the token with the secret key
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """
    Decodes and validates a JWT token received from the client.

    This function is used to PROTECT private routes.
    It verifies that the token is authentic (valid signature) and has not expired.

    Args:
        token (str): JWT token sent by the client in the Authorization header.
                    Ex: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    Returns:
        dict: Token payload if valid. Ex: {"sub": "user@email.com", "exp": ...}
        None: If the token is invalid, expired, or has been tampered with.

    Usage example:
        payload = decode_token(received_token)
        if payload is None:
            # Reject the request (401 Unauthorized)
        else:
            user = payload.get("sub")
            # Allow access to the protected resource
    """   
    try:
        # Attempt to decode the token using the same key and algorithm
        # it was created with. jwt.decode also verifies expiration automatically.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # If the token is invalid (wrong signature, expired, malformed),
        # JWTError is raised. We return None to signal an authentication failure.
        return None

