import mysql.connector
from mysql.connector import Error
import os

# Database configuration [citation:2][citation:5]
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'joynest_db')
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def execute_query(query, params=None, fetch=True):
    """
    Execute a query and return results
    - For SELECT queries: returns fetched rows
    - For INSERT/UPDATE/DELETE: returns lastrowid or rowcount
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = conn.cursor(dictionary=True)  # Returns results as dictionaries
    
    try:
        cursor.execute(query, params or ())
        
        if fetch:
            # For SELECT queries
            result = cursor.fetchall()
            return result
        else:
            # For INSERT/UPDATE/DELETE
            conn.commit()
            return cursor.lastrowid or cursor.rowcount
            
    except Error as e:
        print(f"Query execution error: {e}")
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()