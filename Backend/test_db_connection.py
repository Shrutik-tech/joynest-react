# backend/test_db_connection.py

import mysql.connector
from mysql.connector import Error

def test_connection():
    print("🔄 Attempting to connect to MySQL database...")
    print("-" * 50)
    
    try:
        # Establish connection to MySQL (XAMPP default credentials)
        connection = mysql.connector.connect(
            host="localhost",      # XAMPP runs on localhost
            port=3306,              # Default MySQL port
            user="root",            # XAMPP default username
            password="",             # XAMPP default password (empty)
            database="joynest_db"    # Your database name
        )
        
        if connection.is_connected():
            print("✅ SUCCESS! Connected to MySQL database!")
            print("-" * 50)
            
            # Get server info
            db_info = connection.get_server_info()
            print(f"📊 MySQL Server version: {db_info}")
            
            # Get current database
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
            print(f"📁 Current database: {db_name[0]}")
            
            # Show all tables
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            
            if tables:
                print("\n📋 Tables in database:")
                for table in tables:
                    print(f"   - {table[0]}")
            else:
                print("\n📋 No tables found in database yet.")
            
            cursor.close()
            return connection
            
    except Error as e:
        print("❌ ERROR: Failed to connect to MySQL!")
        print("-" * 50)
        print(f"Error details: {e}")
        print("\n🔍 Possible solutions:")
        print("   1. Make sure XAMPP MySQL is running (Start MySQL in XAMPP Control Panel)")
        print("   2. Check if database 'joynest_db' exists (create it in phpMyAdmin)")
        print("   3. Verify connection credentials (host, port, user, password)")
        return None

if __name__ == "__main__":
    print("\n🔌 MySQL Connection Test")
    print("=" * 50)
    
    conn = test_connection()
    
    if conn:
        print("\n" + "=" * 50)
        print("✅ Connection test completed successfully!")
        conn.close()
        print("🔒 Connection closed.")
    else:
        print("\n" + "=" * 50)
        print("❌ Connection test failed. Please check the errors above.")

# Optional: Add a simple menu for more tests
def run_additional_tests(connection):
    """Run additional database tests"""
    if not connection:
        return
    
    print("\n📝 Running additional tests...")
    cursor = connection.cursor(dictionary=True)
    
    # Test creating a simple table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_connection (
                id INT AUTO_INCREMENT PRIMARY KEY,
                test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message VARCHAR(100)
            )
        """)
        connection.commit()
        print("✅ Test table created/verified")
    except Exception as e:
        print(f"❌ Failed to create test table: {e}")
    
    # Test inserting data
    try:
        cursor.execute(
            "INSERT INTO test_connection (message) VALUES (%s)",
            ("Connection test successful!",)
        )
        connection.commit()
        print("✅ Test data inserted")
    except Exception as e:
        print(f"❌ Failed to insert test data: {e}")
    
    cursor.close()