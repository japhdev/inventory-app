import psycopg2
import psycopg2.extras

from dotenv import load_dotenv
from pathlib import Path
import os

# Load environment variables from the .env file located
# in the root directory of the project. This keeps sensitive
# information such as database credentials out of the source code.
load_dotenv(Path(__file__).parent.parent / ".env")


def get_connection():
    """
    Create and return a connection to the PostgreSQL database.

    The connection parameters are loaded from environment variables
    defined in the .env file to avoid exposing sensitive credentials
    directly in the codebase.

    Required environment variables (.env):
        DB_HOST      -> Database server host
        DB_NAME      -> Database name
        DB_USER      -> Database user
        DB_PASSWORD  -> Database user password

    Returns:
        psycopg2.extensions.connection:
            A connection object that allows executing SQL queries
            against the PostgreSQL database.
    """
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),           # Database server address
        dbname=os.getenv("DB_NAME"),         # Target database name
        user=os.getenv("DB_USER"),           # Authentication username
        password=os.getenv("DB_PASSWORD")    # Authentication password
    )