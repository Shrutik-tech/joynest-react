# app.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import hashlib
from datetime import datetime
import re

app = Flask(__name__)
app.secret_key = 'your-secret-key-here-change-this-in-production'  # Required for session
CORS(app)  # This allows your React app to communicate with Flask

# Database configuration
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'joynest_db'
}

# Translations dictionary for multi-language support
translations = {
    'en': {
        'birthday': 'Birthday Party',
        'wedding': 'Wedding',
        'corporate': 'Corporate Event',
        'conference': 'Conference',
        'social': 'Social Gathering',
        'general': 'Event',
        'venue': 'Venue',
        'catering': 'Catering',
        'photography': 'Photography',
        'decoration': 'Decoration',
        'entertainment': 'Entertainment',
        'audio_visual': 'Audio Visual',
        'designer': 'Designer',
        'initial_planning': 'Initial Planning',
        'based_on_your_description': 'Based on your description, here are key planning steps:',
        'define_goals': 'Define your event goals and theme',
        'create_guest_list': 'Create a guest list and budget',
        'choose_date_venue': 'Choose a suitable date and venue',
        'plan_timeline': 'Plan the event timeline',
        'arrange_vendors': 'Arrange necessary vendors',
        'vendor_recommendations': 'Vendor Recommendations',
        'visit_vendors_tab': 'Visit the Vendors tab to find:',
        'browse_vendors': 'Browse Vendors',
        'ai_plan_generated': 'AI plan generated successfully!'
    },
    'es': {
        'birthday': 'Fiesta de Cumpleaños',
        'wedding': 'Boda',
        'corporate': 'Evento Corporativo',
        'conference': 'Conferencia',
        'social': 'Reunión Social',
        'general': 'Evento',
        'venue': 'Lugar',
        'catering': 'Catering',
        'photography': 'Fotografía',
        'decoration': 'Decoración',
        'entertainment': 'Entretenimiento',
        'audio_visual': 'Audiovisual',
        'designer': 'Diseñador',
        'initial_planning': 'Planificación Inicial',
        'based_on_your_description': 'Basado en tu descripción, aquí están los pasos clave:',
        'define_goals': 'Define tus metas y tema del evento',
        'create_guest_list': 'Crea lista de invitados y presupuesto',
        'choose_date_venue': 'Elige fecha y lugar adecuados',
        'plan_timeline': 'Planifica el cronograma',
        'arrange_vendors': 'Organiza los proveedores necesarios',
        'vendor_recommendations': 'Recomendaciones de Proveedores',
        'visit_vendors_tab': 'Visita la pestaña de Proveedores para encontrar:',
        'browse_vendors': 'Ver Proveedores',
        'ai_plan_generated': '¡Plan de IA generado exitosamente!'
    },
    'hi': {
        'birthday': 'जन्मदिन पार्टी',
        'wedding': 'शादी',
        'corporate': 'कॉर्पोरेट इवेंट',
        'conference': 'सम्मेलन',
        'social': 'सामाजिक समारोह',
        'general': 'इवेंट',
        'venue': 'स्थल',
        'catering': 'खानपान',
        'photography': 'फोटोग्राफी',
        'decoration': 'सजावट',
        'entertainment': 'मनोरंजन',
        'audio_visual': 'ऑडियो विजुअल',
        'designer': 'डिजाइनर',
        'initial_planning': 'प्रारंभिक योजना',
        'based_on_your_description': 'आपके विवरण के आधार पर, मुख्य योजना चरण:',
        'define_goals': 'अपने इवेंट के लक्ष्य और थीम तय करें',
        'create_guest_list': 'अतिथि सूची और बजट बनाएं',
        'choose_date_venue': 'उपयुक्त तारीख और स्थान चुनें',
        'plan_timeline': 'इवेंट की समयरेखा बनाएं',
        'arrange_vendors': 'आवश्यक विक्रेताओं की व्यवस्था करें',
        'vendor_recommendations': 'विक्रेता सिफारिशें',
        'visit_vendors_tab': 'विक्रेता टैब पर जाएं और खोजें:',
        'browse_vendors': 'विक्रेता देखें',
        'ai_plan_generated': 'एआई योजना सफलतापूर्वक तैयार हो गई!'
    }
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except Error as e:
        print(f"Database connection error: {e}")
        return None

@app.route('/')
def home():
    return jsonify({
        'message': 'JoyNest Backend API is running!',
        'status': 'success',
        'database': 'connected'
    })

# ============================================
# USER ENDPOINTS
# ============================================

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users from database"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, username, email, full_name, phone, is_vendor, created_at, updated_at FROM users")
        users = cursor.fetchall()
        return jsonify(users)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    print("=" * 50)
    print("🔵 REGISTRATION ATTEMPT RECEIVED")
    
    data = request.json
    print(f"📦 Request data: {data}")
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    # Simple password validation (at least 6 characters)
    password = data.get('password', '')
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'User already exists'}), 409
        
        # Hash the password
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        # Determine if user is vendor or planner
        is_vendor = 1 if data.get('userType') == 'vendor' else 0
        
        # Insert new user
        query = """
        INSERT INTO users (username, email, password, full_name, phone, is_vendor)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        username = data.get('username', data['email'].split('@')[0])
        full_name = data.get('fullName', '')
        phone = data.get('phone', '')  # This now includes country code
        
        values = (username, data['email'], password_hash, full_name, phone, is_vendor)
        
        cursor.execute(query, values)
        conn.commit()
        
        user_id = cursor.lastrowid
        print(f"✅ User registered with ID: {user_id}")
        
        # If user is a vendor, also create vendor profile
        if is_vendor == 1:
            try:
                # First, check if vendor_profiles table exists, if not create it
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS vendor_profiles (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT UNIQUE NOT NULL,
                        business_name VARCHAR(100) NOT NULL,
                        full_name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) NOT NULL,
                        service_category VARCHAR(50) NOT NULL,
                        budget_min DECIMAL(10,2),
                        budget_max DECIMAL(10,2),
                        contact_phone VARCHAR(20),
                        username VARCHAR(50) NOT NULL,
                        description TEXT,
                        views INT DEFAULT 0,
                        bookings_count INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                """)
                conn.commit()
                
                # Insert vendor profile
                vendor_query = """
                INSERT INTO vendor_profiles 
                (user_id, business_name, full_name, email, service_category, 
                 budget_min, budget_max, contact_phone, username, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                vendor_values = (
                    user_id,
                    data.get('businessName', ''),
                    data.get('fullName', ''),
                    data.get('email', ''),
                    data.get('serviceCategory', ''),
                    data.get('budgetMin', 0),
                    data.get('budgetMax', 0),
                    phone,  # Use the same phone number with country code
                    username,
                    data.get('description', '')
                )
                cursor.execute(vendor_query, vendor_values)
                conn.commit()
                print(f"✅ Vendor profile created for user ID: {user_id}")
            except Exception as vendor_error:
                print(f"⚠️ Error creating vendor profile: {vendor_error}")
                # Don't fail registration if vendor profile creation fails
                pass
        
        # Return user data
        new_user = {
            'id': user_id,
            'username': username,
            'email': data['email'],
            'fullName': full_name,
            'phone': phone,
            'user_type': 'vendor' if is_vendor else 'planner',
            'is_vendor': is_vendor
        }
        
        return jsonify({'message': 'User registered successfully', 'user': new_user}), 201
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    print("=" * 50)
    print("🔵 LOGIN ATTEMPT RECEIVED")
    
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        query = """
            SELECT id, username, email, full_name, phone, is_vendor
            FROM users 
            WHERE email = %s AND password = %s
        """
        cursor.execute(query, (data['email'], password_hash))
        
        user = cursor.fetchone()
        
        if user:
            print(f"✅ Login successful for: {data['email']}")
            
            # Set language in session if provided
            if data.get('language'):
                session['language'] = data.get('language')
            else:
                session['language'] = 'en'
            
            # Get vendor data if user is a vendor
            if user['is_vendor']:
                cursor.execute("SELECT * FROM vendor_profiles WHERE user_id = %s", (user['id'],))
                vendor_data = cursor.fetchone()
                if vendor_data:
                    user['businessName'] = vendor_data['business_name']
                    user['serviceCategory'] = vendor_data['service_category']
            
            user['user_type'] = 'vendor' if user['is_vendor'] else 'planner'
            user['fullName'] = user['full_name']
            return jsonify({'message': 'Login successful', 'user': user})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# EVENT ENDPOINTS
# ============================================

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event"""
    print("=" * 50)
    print("🔵 EVENT CREATION ATTEMPT RECEIVED")
    
    try:
        data = request.json
        print("📦 Received event data:", data)
        
        # Validate required fields
        if not data.get('title') or not data.get('user_id'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = """
        INSERT INTO events (user_id, title, event_type, event_date, event_time, 
                           location, guests, budget, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            data['user_id'],
            data['title'],
            data.get('event_type', ''),
            data.get('date', ''),  # Frontend sends 'date', maps to 'event_date'
            data.get('time', ''),
            data.get('location', ''),
            data.get('guests', 0),
            data.get('budget', 0),
            data.get('description', '')
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        event_id = cursor.lastrowid
        print(f"✅ Event created with ID: {event_id}")
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Event created successfully', 'event_id': event_id, 'success': True}), 201
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/events/user/<int:user_id>', methods=['GET'])
def get_user_events(user_id):
    """Get all events for a specific user"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM events WHERE user_id = %s ORDER BY event_date DESC"
        cursor.execute(query, (user_id,))
        events = cursor.fetchall()
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'message': 'Event deleted successfully', 'success': True})
        else:
            return jsonify({'error': 'Event not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# VENDOR ENDPOINTS (Legacy - for backward compatibility)
# ============================================

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    """Get all vendors (legacy)"""
    service_type = request.args.get('service_type', '')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        if service_type:
            query = "SELECT * FROM vendors WHERE service_type = %s"
            cursor.execute(query, (service_type,))
        else:
            query = "SELECT * FROM vendors"
            cursor.execute(query)
        
        vendors = cursor.fetchall()
        return jsonify(vendors)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors', methods=['POST'])
def create_vendor():
    """Create a new vendor profile (legacy)"""
    try:
        data = request.json
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = """
        INSERT INTO vendors (user_id, business_name, service_type, budget_min, 
                           budget_max, phone, description, rating)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            data.get('user_id'),
            data.get('business_name'),
            data.get('service_type'),
            data.get('budget_min', 0),
            data.get('budget_max', 0),
            data.get('phone', ''),
            data.get('description', ''),
            data.get('rating', 0.0)
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        vendor_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Vendor created successfully', 'vendor_id': vendor_id, 'success': True}), 201
        
    except Exception as e:
        print(f"Error creating vendor: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================
# VENDOR PROFILE ENDPOINTS (New - for vendor dashboard)
# ============================================

@app.route('/api/vendor/profile/<int:user_id>', methods=['GET'])
def get_vendor_profile(user_id):
    """Get vendor profile by user ID for editing"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # First, ensure the table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                business_name VARCHAR(100) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                service_category VARCHAR(50) NOT NULL,
                budget_min DECIMAL(10,2),
                budget_max DECIMAL(10,2),
                contact_phone VARCHAR(20),
                username VARCHAR(50) NOT NULL,
                description TEXT,
                views INT DEFAULT 0,
                bookings_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
        cursor.execute("SELECT * FROM vendor_profiles WHERE user_id = %s", (user_id,))
        profile = cursor.fetchone()
        
        if profile:
            return jsonify(profile)
        else:
            return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        print(f"Error fetching vendor profile: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendor/profile', methods=['POST'])
def save_vendor_profile():
    """Save or update vendor profile from dashboard"""
    try:
        data = request.json
        print("📦 Received vendor profile data:", data)
        
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        # Validate required fields
        required_fields = ['businessName', 'fullName', 'email', 'serviceCategory', 
                          'budgetMin', 'budgetMax', 'contactPhone', 'username']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Ensure table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNIQUE NOT NULL,
                business_name VARCHAR(100) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                service_category VARCHAR(50) NOT NULL,
                budget_min DECIMAL(10,2),
                budget_max DECIMAL(10,2),
                contact_phone VARCHAR(20),
                username VARCHAR(50) NOT NULL,
                description TEXT,
                views INT DEFAULT 0,
                bookings_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
        # Check if profile exists
        cursor.execute("SELECT id FROM vendor_profiles WHERE user_id = %s", (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing profile
            query = """
            UPDATE vendor_profiles 
            SET business_name=%s, full_name=%s, email=%s, service_category=%s, 
                budget_min=%s, budget_max=%s, contact_phone=%s, username=%s, description=%s
            WHERE user_id=%s
            """
            values = (
                data.get('businessName'), data.get('fullName'), data.get('email'),
                data.get('serviceCategory'), data.get('budgetMin'), data.get('budgetMax'),
                data.get('contactPhone'), data.get('username'), data.get('description'),
                user_id
            )
            cursor.execute(query, values)
            message = 'Profile updated successfully'
        else:
            # Create new profile
            query = """
            INSERT INTO vendor_profiles 
            (user_id, business_name, full_name, email, service_category, 
             budget_min, budget_max, contact_phone, username, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                user_id, data.get('businessName'), data.get('fullName'), data.get('email'),
                data.get('serviceCategory'), data.get('budgetMin'), data.get('budgetMax'),
                data.get('contactPhone'), data.get('username'), data.get('description')
            )
            cursor.execute(query, values)
            message = 'Profile created successfully'
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': message
        }), 200
        
    except Exception as e:
        print(f"❌ Error saving vendor profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ============================================
# VENDOR BOOKINGS ENDPOINTS
# ============================================

@app.route('/api/vendor/bookings/<int:user_id>', methods=['GET'])
def get_vendor_bookings(user_id):
    """Get all bookings for a vendor"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Create vendor_bookings table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                client_name VARCHAR(100) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_date DATE NOT NULL,
                event_time VARCHAR(10),
                location VARCHAR(255),
                guests INT,
                budget DECIMAL(10,2),
                requirements TEXT,
                status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_vendor_id (vendor_id),
                INDEX idx_status (status)
            )
        """)
        conn.commit()
        
        # Get all bookings for this vendor
        query = """
            SELECT * FROM vendor_bookings 
            WHERE vendor_id = %s 
            ORDER BY 
                CASE status
                    WHEN 'pending' THEN 1
                    WHEN 'confirmed' THEN 2
                    WHEN 'completed' THEN 3
                    WHEN 'cancelled' THEN 4
                END,
                event_date DESC
        """
        cursor.execute(query, (user_id,))
        bookings = cursor.fetchall()
        
        # Format the data for frontend
        formatted_bookings = []
        for booking in bookings:
            formatted_bookings.append({
                'id': booking['id'],
                'clientName': booking['client_name'],
                'eventType': booking['event_type'],
                'date': booking['event_date'].strftime('%Y-%m-%d') if booking['event_date'] else '',
                'time': booking['event_time'] or '',
                'location': booking['location'] or '',
                'guests': booking['guests'] or 0,
                'budget': float(booking['budget']) if booking['budget'] else 0,
                'requirements': booking['requirements'] or '',
                'status': booking['status'],
                'created_at': booking['created_at'].strftime('%Y-%m-%d %H:%M:%S') if booking['created_at'] else ''
            })
        
        # Update bookings_count in vendor_profiles
        cursor.execute("""
            UPDATE vendor_profiles 
            SET bookings_count = (SELECT COUNT(*) FROM vendor_bookings WHERE vendor_id = %s)
            WHERE user_id = %s
        """, (user_id, user_id))
        conn.commit()
        
        return jsonify(formatted_bookings)
        
    except Exception as e:
        print(f"Error fetching vendor bookings: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendor/bookings', methods=['POST'])
def create_vendor_booking():
    """Create a new booking for a vendor"""
    try:
        data = request.json
        print("📦 Received booking data:", data)
        
        vendor_id = data.get('vendor_id')
        
        if not vendor_id:
            return jsonify({'error': 'vendor_id required'}), 400
        
        # Validate required fields
        required_fields = ['client_name', 'event_type', 'event_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                client_name VARCHAR(100) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_date DATE NOT NULL,
                event_time VARCHAR(10),
                location VARCHAR(255),
                guests INT,
                budget DECIMAL(10,2),
                requirements TEXT,
                status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
        # Insert booking
        query = """
            INSERT INTO vendor_bookings 
            (vendor_id, client_name, event_type, event_date, event_time, location, guests, budget, requirements, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            vendor_id,
            data.get('client_name'),
            data.get('event_type'),
            data.get('event_date'),
            data.get('event_time', ''),
            data.get('location', ''),
            data.get('guests', 0),
            data.get('budget', 0),
            data.get('requirements', ''),
            data.get('status', 'pending')
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        booking_id = cursor.lastrowid
        
        # Update bookings_count in vendor_profiles
        cursor.execute("""
            UPDATE vendor_profiles 
            SET bookings_count = bookings_count + 1 
            WHERE user_id = %s
        """, (vendor_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Booking created successfully',
            'booking_id': booking_id
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating booking: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/vendor/bookings/<int:booking_id>', methods=['PUT'])
def update_vendor_booking(booking_id):
    """Update booking status"""
    try:
        data = request.json
        print(f"📦 Updating booking {booking_id}: {data}")
        
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'status required'}), 400
        
        if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
            return jsonify({'error': 'Invalid status'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = "UPDATE vendor_bookings SET status = %s WHERE id = %s"
        cursor.execute(query, (new_status, booking_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Booking not found'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Booking status updated to {new_status}'
        }), 200
        
    except Exception as e:
        print(f"❌ Error updating booking: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/vendor/bookings/<int:booking_id>', methods=['DELETE'])
def delete_vendor_booking(booking_id):
    """Delete a booking"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # First get the vendor_id to update count later
        cursor.execute("SELECT vendor_id FROM vendor_bookings WHERE id = %s", (booking_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'error': 'Booking not found'}), 404
        
        vendor_id = result[0]
        
        # Delete the booking
        cursor.execute("DELETE FROM vendor_bookings WHERE id = %s", (booking_id,))
        conn.commit()
        
        # Update bookings_count in vendor_profiles
        cursor.execute("""
            UPDATE vendor_profiles 
            SET bookings_count = (SELECT COUNT(*) FROM vendor_bookings WHERE vendor_id = %s)
            WHERE user_id = %s
        """, (vendor_id, vendor_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Booking deleted successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ Error deleting booking: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# VENDOR VIEW TRACKING
# ============================================

@app.route('/api/vendor/view', methods=['POST'])
def track_vendor_view():
    """Track vendor profile views"""
    try:
        data = request.json
        vendor_id = data.get('vendor_id')
        
        if not vendor_id:
            return jsonify({'error': 'vendor_id required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute("UPDATE vendor_profiles SET views = views + 1 WHERE user_id = %s", (vendor_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'View tracked'}), 200
        
    except Exception as e:
        print(f"Error tracking view: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# AI EVENT PLANNING ENDPOINT
# ============================================


@app.route("/api/ai/plan_event", methods=["POST"])
def ai_plan_event():
    """AI endpoint that matches frontend call - handles event planning requests"""
    try:
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({"status": "error", "message": "Event description required"}), 400
        
        prompt = data['prompt'].strip()
        
        # Get current language for personalized response
        current_lang = session.get('language', 'en')
        lang_translations = translations.get(current_lang, translations['en'])
        
        # Extract event details from prompt
        event_details = {
            'type': 'general',
            'guests': 0,
            'budget': 0,
            'location': None,
            'theme': None
        }
        
        # Simple keyword extraction
        prompt_lower = prompt.lower()
        
        # Event type detection
        if any(word in prompt_lower for word in ['birthday', 'bday', 'birth day']):
            event_details['type'] = 'birthday'
        elif any(word in prompt_lower for word in ['wedding', 'marriage', 'shaadi']):
            event_details['type'] = 'wedding'
        elif any(word in prompt_lower for word in ['corporate', 'business', 'office']):
            event_details['type'] = 'corporate'
        elif any(word in prompt_lower for word in ['conference', 'seminar', 'workshop']):
            event_details['type'] = 'conference'
        elif any(word in prompt_lower for word in ['party', 'celebration', 'gathering']):
            event_details['type'] = 'social'
        
        # Extract guests count
        guest_match = re.search(r'(\d+)\s*(?:guests?|people|attendees)', prompt_lower)
        if guest_match:
            event_details['guests'] = int(guest_match.group(1))
        else:
            # Default based on event type
            defaults = {
                'birthday': 30,
                'wedding': 200,
                'corporate': 50,
                'conference': 100,
                'social': 25
            }
            event_details['guests'] = defaults.get(event_details['type'], 25)
        
        # Extract budget - IMPROVED BUDGET EXTRACTION (added lakhs/thousands support)
        budget_match = re.search(r'[₹$]?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lacs?|l|thousand|k|rupees?|rs|inr|₹)?', prompt_lower, re.IGNORECASE)
        if budget_match:
            budget_value = budget_match.group(1).replace(',', '')
            budget_num = float(budget_value)
            
            # Check for lakhs (e.g., "5 lakh" or "5l")
            if 'lakh' in prompt_lower or 'lac' in prompt_lower or 'lacs' in prompt_lower or ' l ' in prompt_lower:
                budget_num = budget_num * 100000
            # Check for thousands
            elif 'thousand' in prompt_lower or 'k' in prompt_lower:
                budget_num = budget_num * 1000
                
            event_details['budget'] = int(budget_num)
        else:
            # Default budget based on event type and guests
            per_person_cost = {
                "birthday": 1000,
                "wedding": 2500,
                "corporate": 1500,
                "conference": 1200,
                "social": 800
            }.get(event_details['type'], 1000)
            
            event_details['budget'] = event_details['guests'] * per_person_cost
        
        # Get relevant vendors
        relevant_vendors = []
        try:
            all_vendors = Vendor.query.all()
            for vendor in all_vendors:
                # Simple matching based on event type
                relevance_score = 0
                
                service_preferences = {
                    'birthday': ['entertainment', 'catering', 'decoration', 'photography'],
                    'wedding': ['venue', 'catering', 'photography', 'decoration', 'designer'],
                    'corporate': ['venue', 'catering', 'audio_visual', 'decoration'],
                    'conference': ['venue', 'catering', 'audio_visual', 'designer'],
                    'social': ['catering', 'entertainment', 'decoration', 'photography']
                }
                
                preferred_services = service_preferences.get(event_details['type'], [])
                if vendor.service_type in preferred_services:
                    relevance_score += 2
                
                if relevance_score > 0:
                    vendor_dict = vendor.to_dict()
                    if not vendor_dict['phone'] and vendor.user:
                        vendor_dict['phone'] = vendor.user.phone
                    relevant_vendors.append(vendor_dict)
                    
                    if len(relevant_vendors) >= 3:
                        break
        except Exception as e:
            print(f"Error fetching vendors: {e}")
        
        # Get current language translations
        event_type_display = lang_translations.get(event_details['type'], event_details['type'].title())
        
        # Calculate budget breakdown based on event type using USER'S ACTUAL BUDGET
        budget = event_details['budget']
        
        # Create a budget breakdown HTML that divides the user's actual budget
        if event_details['type'] == 'wedding':
            venue_amount = int(budget * 0.40)
            catering_amount = int(budget * 0.25)
            photography_amount = int(budget * 0.10)
            decoration_amount = int(budget * 0.10)
            attire_amount = int(budget * 0.15)
            
            budget_breakdown_html = f"""
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 12px; margin: 15px 0; color: white;">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">💰 Your Wedding Budget of ₹{budget:,}</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🏛️ Venue (40%)</span>
                        <span style="font-weight: 600;">₹{venue_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🍽️ Catering (25%)</span>
                        <span style="font-weight: 600;">₹{catering_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>📸 Photography (10%)</span>
                        <span style="font-weight: 600;">₹{photography_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎨 Decorations (10%)</span>
                        <span style="font-weight: 600;">₹{decoration_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>👔 Attire (15%)</span>
                        <span style="font-weight: 600;">₹{attire_amount:,}</span>
                    </div>
                </div>
            </div>
            """
        elif event_details['type'] == 'birthday':
            venue_amount = int(budget * 0.30)
            catering_amount = int(budget * 0.40)
            entertainment_amount = int(budget * 0.20)
            miscellaneous_amount = int(budget * 0.10)
            
            budget_breakdown_html = f"""
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 15px; border-radius: 12px; margin: 15px 0; color: white;">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">🎂 Your Birthday Budget of ₹{budget:,}</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🏛️ Venue & Decor (30%)</span>
                        <span style="font-weight: 600;">₹{venue_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🍰 Food & Cake (40%)</span>
                        <span style="font-weight: 600;">₹{catering_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎮 Entertainment (20%)</span>
                        <span style="font-weight: 600;">₹{entertainment_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>✨ Miscellaneous (10%)</span>
                        <span style="font-weight: 600;">₹{miscellaneous_amount:,}</span>
                    </div>
                </div>
            </div>
            """
        elif event_details['type'] == 'corporate':
            venue_amount = int(budget * 0.35)
            catering_amount = int(budget * 0.25)
            av_amount = int(budget * 0.20)
            marketing_amount = int(budget * 0.15)
            miscellaneous_amount = int(budget * 0.05)
            
            budget_breakdown_html = f"""
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 15px; border-radius: 12px; margin: 15px 0; color: white;">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">🏢 Your Corporate Budget of ₹{budget:,}</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🏛️ Venue (35%)</span>
                        <span style="font-weight: 600;">₹{venue_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🍽️ Catering (25%)</span>
                        <span style="font-weight: 600;">₹{catering_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎤 AV Equipment (20%)</span>
                        <span style="font-weight: 600;">₹{av_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>📢 Marketing (15%)</span>
                        <span style="font-weight: 600;">₹{marketing_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>✨ Miscellaneous (5%)</span>
                        <span style="font-weight: 600;">₹{miscellaneous_amount:,}</span>
                    </div>
                </div>
            </div>
            """
        elif event_details['type'] == 'conference':
            venue_amount = int(budget * 0.30)
            speakers_amount = int(budget * 0.25)
            tech_amount = int(budget * 0.20)
            catering_amount = int(budget * 0.15)
            materials_amount = int(budget * 0.10)
            
            budget_breakdown_html = f"""
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 15px; border-radius: 12px; margin: 15px 0; color: white;">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">🎤 Your Conference Budget of ₹{budget:,}</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🏛️ Venue (30%)</span>
                        <span style="font-weight: 600;">₹{venue_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎯 Speakers (25%)</span>
                        <span style="font-weight: 600;">₹{speakers_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>💻 Technology (20%)</span>
                        <span style="font-weight: 600;">₹{tech_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🍽️ Catering (15%)</span>
                        <span style="font-weight: 600;">₹{catering_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>📚 Materials (10%)</span>
                        <span style="font-weight: 600;">₹{materials_amount:,}</span>
                    </div>
                </div>
            </div>
            """
        elif event_details['type'] == 'social':
            venue_amount = int(budget * 0.35)
            catering_amount = int(budget * 0.30)
            entertainment_amount = int(budget * 0.20)
            decoration_amount = int(budget * 0.10)
            miscellaneous_amount = int(budget * 0.05)
            
            budget_breakdown_html = f"""
            <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 15px; border-radius: 12px; margin: 15px 0; color: white;">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Your Social Budget of ₹{budget:,}</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🏛️ Venue (35%)</span>
                        <span style="font-weight: 600;">₹{venue_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🍽️ Food & Drinks (30%)</span>
                        <span style="font-weight: 600;">₹{catering_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎮 Entertainment (20%)</span>
                        <span style="font-weight: 600;">₹{entertainment_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎨 Decorations (10%)</span>
                        <span style="font-weight: 600;">₹{decoration_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>✨ Miscellaneous (5%)</span>
                        <span style="font-weight: 600;">₹{miscellaneous_amount:,}</span>
                    </div>
                </div>
            </div>
            """
        else:  # General event
            venue_amount = int(budget * 0.30)
            catering_amount = int(budget * 0.25)
            decoration_amount = int(budget * 0.15)
            entertainment_amount = int(budget * 0.10)
            marketing_amount = int(budget * 0.10)
            contingency_amount = int(budget * 0.10)
            
            budget_breakdown_html = f"""
            <div style="background: linear-gradient(135deg, #5f2c82 0%, #49a09d 100%); padding: 15px; border-radius: 12px; margin: 15px 0; color: white;">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">📋 Your Event Budget of ₹{budget:,}</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🏛️ Venue (30%)</span>
                        <span style="font-weight: 600;">₹{venue_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🍽️ Catering (25%)</span>
                        <span style="font-weight: 600;">₹{catering_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎨 Decorations (15%)</span>
                        <span style="font-weight: 600;">₹{decoration_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>🎮 Entertainment (10%)</span>
                        <span style="font-weight: 600;">₹{entertainment_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>📢 Marketing (10%)</span>
                        <span style="font-weight: 600;">₹{marketing_amount:,}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px;">
                        <span>💰 Contingency (10%)</span>
                        <span style="font-weight: 600;">₹{contingency_amount:,}</span>
                    </div>
                </div>
                <p style="margin-top: 10px; font-size: 12px; opacity: 0.9; text-align: center;">💡 Keep 10% aside for unexpected costs!</p>
            </div>
            """
        
        # Generate AI response based on event type
        event_responses = {
            'birthday': f"""
            <div class="ai-plan">
                <h3>🎉 {lang_translations.get('birthday', 'Birthday Party')} Planning Guide</h3>
                {budget_breakdown_html}
                <div class="plan-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Guest List & Invitations</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Plan for {event_details['guests']} guests<br>
                            • Send invitations 2-3 weeks in advance<br>
                            • Create a theme (e.g., Colorful, Retro, Movie Night)<br>
                            • Consider age group for appropriate activities
                        </p>
                    </div>
                </div>
                
                <div class="plan-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Budget Allocation (₹{event_details['budget']:,})</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Venue & Decorations: ₹{int(event_details['budget'] * 0.3):,}<br>
                            • Food & Cake: ₹{int(event_details['budget'] * 0.4):,}<br>
                            • Entertainment: ₹{int(event_details['budget'] * 0.2):,}<br>
                            • Miscellaneous: ₹{int(event_details['budget'] * 0.1):,}
                        </p>
                    </div>
                </div>
            """,
            'wedding': f"""
            <div class="ai-plan">
                <h3>💍 {lang_translations.get('wedding', 'Wedding')} Planning Guide</h3>
                {budget_breakdown_html}
                <div class="plan-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Wedding Timeline</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • 6-12 months: Book venue, photographer, caterer<br>
                            • 3-6 months: Finalize guest list, send save-the-dates<br>
                            • 1-2 months: Arrange decorations, music, transportation<br>
                            • 2 weeks: Finalize menu and seating chart<br>
                            • 1 week: Confirm all vendors
                        </p>
                    </div>
                </div>
                
                <div class="plan-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Budget Breakdown (₹{event_details['budget']:,})</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Venue: ₹{int(event_details['budget'] * 0.4):,}<br>
                            • Catering: ₹{int(event_details['budget'] * 0.25):,}<br>
                            • Photography/Videography: ₹{int(event_details['budget'] * 0.1):,}<br>
                            • Decorations: ₹{int(event_details['budget'] * 0.1):,}<br>
                            • Attire & Jewelry: ₹{int(event_details['budget'] * 0.15):,}
                        </p>
                    </div>
                </div>
            """,
            'corporate': f"""
            <div class="ai-plan">
                <h3>🏢 {lang_translations.get('corporate', 'Corporate Event')} Planning Guide</h3>
                {budget_breakdown_html}
                <div class="plan-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Event Strategy</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Define objectives: Networking, Training, Product Launch<br>
                            • Create detailed agenda with timing<br>
                            • Arrange professional AV equipment<br>
                            • Plan for breaks and networking sessions<br>
                            • Prepare branded materials
                        </p>
                    </div>
                </div>
                
                <div class="plan-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Budget Allocation (₹{event_details['budget']:,})</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Venue: ₹{int(event_details['budget'] * 0.35):,}<br>
                            • Catering: ₹{int(event_details['budget'] * 0.25):,}<br>
                            • AV Equipment: ₹{int(event_details['budget'] * 0.2):,}<br>
                            • Marketing Materials: ₹{int(event_details['budget'] * 0.15):,}<br>
                            • Miscellaneous: ₹{int(event_details['budget'] * 0.05):,}
                        </p>
                    </div>
                </div>
            """,
            'conference': f"""
            <div class="ai-plan">
                <h3>🎤 {lang_translations.get('conference', 'Conference')} Planning Guide</h3>
                {budget_breakdown_html}
                <div class="plan-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Conference Setup</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Book speakers 3-4 months in advance<br>
                            • Arrange breakout sessions and workshops<br>
                            • Setup registration desk and check-in system<br>
                            • Plan for networking areas<br>
                            • Prepare conference materials and swag bags
                        </p>
                    </div>
                </div>
                
                <div class="plan-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Budget Breakdown (₹{event_details['budget']:,})</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Venue & Facilities: ₹{int(event_details['budget'] * 0.3):,}<br>
                            • Speaker Fees: ₹{int(event_details['budget'] * 0.25):,}<br>
                            • Technology & AV: ₹{int(event_details['budget'] * 0.2):,}<br>
                            • Food & Beverages: ₹{int(event_details['budget'] * 0.15):,}<br>
                            • Materials & Marketing: ₹{int(event_details['budget'] * 0.1):,}
                        </p>
                    </div>
                </div>
            """
        }
        
        # Get the appropriate response or use default
        plan_html = event_responses.get(event_details['type'], f"""
            <div class="ai-plan">
                <h3>📋 Event Planning Guide</h3>
                {budget_breakdown_html}
                <div class="plan-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Basic Planning Steps</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Define your event goals and objectives<br>
                            • Create a guest list ({event_details['guests']} guests)<br>
                            • Set a realistic budget (₹{event_details['budget']:,})<br>
                            • Choose a suitable date and venue<br>
                            • Plan the event flow and schedule
                        </p>
                    </div>
                </div>
                
                <div class="plan-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Key Considerations</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            • Send invitations well in advance<br>
                            • Arrange necessary permits if required<br>
                            • Plan for contingencies and backups<br>
                            • Consider accessibility for all guests<br>
                            • Create a checklist for day-of tasks
                        </p>
                    </div>
                </div>
            </div>
        """)
        
        # Add vendor recommendations if available
        if relevant_vendors:
            plan_html += """
                <div class="plan-step">
                    <div class="step-number">3</div>
                    <div>
                        <strong>Recommended Vendors</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
            """
            
            for vendor in relevant_vendors:
                service_type = lang_translations.get(vendor['service_type'], vendor['service_type'].title())
                plan_html += f"""
                            • <strong>{vendor['company_name']}</strong> ({service_type})<br>
                              <small>Budget: ₹{vendor['budget_min']:,} - ₹{vendor['budget_max']:,} | Phone: {vendor.get('phone', 'Contact for details')}</small><br>
                """
            
            plan_html += """
                        </p>
                        <button onclick="document.querySelector('.tab[data-tab=\\'vendors\\']').click()" 
                                class="btn btn-primary" style="margin-top: 0.5rem; font-size: 0.9rem;">
                            <i class="fas fa-store"></i> View All Vendors
                        </button>
                    </div>
                </div>
            """
        else:
            plan_html += """
                <div class="plan-step">
                    <div class="step-number">3</div>
                    <div>
                        <strong>Vendor Recommendations</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            Check the Vendors tab for professional service providers in your area.
                        </p>
                        <button onclick="document.querySelector('.tab[data-tab=\\'vendors\\']').click()" 
                                class="btn btn-primary" style="margin-top: 0.5rem; font-size: 0.9rem;">
                            <i class="fas fa-store"></i> Browse Vendors
                        </button>
                    </div>
                </div>
            """
        
        plan_html += "</div>"
        
        return jsonify({
            'status': 'success',
            'plan_html': plan_html,
            'response': f"I've created a detailed plan for your {event_type_display} with {event_details['guests']} guests and ₹{event_details['budget']:,} budget.",
            'event_details': event_details
        }), 200
        
    except Exception as e:
        print(f"AI Error: {e}")
        current_lang = session.get('language', 'en')
        lang_translations = translations.get(current_lang, translations['en'])
        
        return jsonify({
            'status': 'success',
            'plan_html': f"""
            <div class="ai-plan">
                <h3>📋 Event Planning Assistant</h3>
                <div class="plan-step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>{lang_translations.get('initial_planning', 'Initial Planning')}</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            {lang_translations.get('based_on_your_description', 'Based on your description, here are key planning steps:')}<br>
                            • {lang_translations.get('define_goals', 'Define your event goals and theme')}<br>
                            • {lang_translations.get('create_guest_list', 'Create a guest list and budget')}<br>
                            • {lang_translations.get('choose_date_venue', 'Choose a suitable date and venue')}<br>
                            • {lang_translations.get('plan_timeline', 'Plan the event timeline')}<br>
                            • {lang_translations.get('arrange_vendors', 'Arrange necessary vendors')}
                        </p>
                    </div>
                </div>
                
                <div class="plan-step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>{lang_translations.get('vendor_recommendations', 'Vendor Recommendations')}</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                            {lang_translations.get('visit_vendors_tab', 'Visit the Vendors tab to find:')}<br>
                            • Catering services<br>
                            • Photography & videography<br>
                            • Venue providers<br>
                            • Decoration specialists<br>
                            • Entertainment options
                        </p>
                        <button onclick="document.querySelector('.tab[data-tab=\\'vendors\\']').click()" 
                                class="btn btn-primary" style="margin-top: 0.5rem; font-size: 0.9rem;">
                            <i class="fas fa-store"></i> {lang_translations.get('browse_vendors', 'Browse Vendors')}
                        </button>
                    </div>
                </div>
            </div>
            """,
            'response': lang_translations.get('ai_plan_generated', 'AI plan generated successfully!'),
            'event_details': {'type': 'general', 'guests': 0, 'budget': 0}
        }), 200
# ============================================
# NEW ENDPOINT: GET ALL VENDORS FOR FIND VENDORS TAB
# ============================================

@app.route('/api/all-vendors', methods=['GET'])
def get_all_vendors():
    """Get all registered vendors for the Find Vendors tab"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Get filter from query parameter
        service_type = request.args.get('service_type', '')
        
        # Base query to get all vendors from vendor_profiles table
        base_query = """
        SELECT 
            vp.id,
            vp.user_id,
            vp.business_name,
            vp.service_category as service_type,
            vp.description,
            vp.budget_min as min_price,
            vp.budget_max as max_price,
            vp.contact_phone as phone,
            vp.email,
            vp.full_name as owner_name,
            vp.views,
            vp.bookings_count,
            u.created_at as member_since
        FROM vendor_profiles vp
        JOIN users u ON vp.user_id = u.id
        """
        
        # Add filter if service_type is provided
        if service_type:
            query = base_query + " WHERE vp.service_category = %s ORDER BY vp.created_at DESC"
            cursor.execute(query, (service_type,))
        else:
            query = base_query + " ORDER BY vp.created_at DESC"
            cursor.execute(query)
        
        vendors = cursor.fetchall()
        
        # Format the data
        formatted_vendors = []
        for vendor in vendors:
            formatted_vendors.append({
                'id': vendor['id'],
                'user_id': vendor['user_id'],
                'business_name': vendor['business_name'],
                'service_type': vendor['service_type'],
                'description': vendor['description'],
                'min_price': float(vendor['min_price']) if vendor['min_price'] else 0,
                'max_price': float(vendor['max_price']) if vendor['max_price'] else 0,
                'phone': vendor['phone'],
                'email': vendor['email'],
                'owner_name': vendor['owner_name'],
                'views': vendor['views'] or 0,
                'bookings_count': vendor['bookings_count'] or 0,
                'member_since': vendor['member_since'].strftime('%b %Y') if vendor['member_since'] else 'Recently',
                'rating': 4.5  # Default rating
            })
        
        print(f"✅ Found {len(formatted_vendors)} vendors")
        return jsonify(formatted_vendors)
    except Exception as e:
        print(f"❌ Error fetching vendors: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# AI-POWERED VENDOR FINDER FOR FIND VENDORS TAB
# ============================================

@app.route('/api/ai-find-vendors', methods=['POST'])
def ai_find_vendors():
    """
    AI-powered vendor finder that suggests vendors based on smart budget distribution
    This is the enhanced endpoint for the Find Vendors tab
    """
    try:
        data = request.json
        print("=" * 50)
        print("🔍 AI VENDOR FINDER REQUEST RECEIVED")
        print(f"📦 Request data: {data}")
        
        # Get request parameters
        event_type = data.get('event_type', 'wedding').lower()
        total_budget = float(data.get('total_budget', 10000))
        guests = int(data.get('guests', 100))
        selected_categories = data.get('categories', [])  # Optional: filter by specific categories
        min_rating = float(data.get('min_rating', 0))  # Optional: minimum rating filter
        
        # Step 1: Determine budget level based on per-person cost
        per_person_budget = total_budget / guests if guests > 0 else total_budget
        
        if per_person_budget < 50:
            budget_level = 'low'
            budget_description = 'Budget-friendly'
        elif per_person_budget < 150:
            budget_level = 'medium'
            budget_description = 'Moderate'
        else:
            budget_level = 'high'
            budget_description = 'Premium'
        
        print(f"📊 Budget Analysis: ₹{total_budget} total, ₹{per_person_budget}/person → {budget_description} ({budget_level})")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # First, ensure the budget_suggestions table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS budget_suggestions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_type VARCHAR(50) NOT NULL,
                budget_level VARCHAR(20) NOT NULL,
                category VARCHAR(50) NOT NULL,
                suggested_amount DECIMAL(10,2),
                percentage DECIMAL(5,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_event_type (event_type),
                INDEX idx_budget_level (budget_level)
            )
        """)
        conn.commit()
        
        # Check if we have budget suggestions, if not, insert some default ones
        cursor.execute("SELECT COUNT(*) as count FROM budget_suggestions")
        count_result = cursor.fetchone()
        if count_result['count'] == 0:
            # Insert default budget suggestions
            budget_data = [
                # Wedding suggestions
                ('wedding', 'low', 'venue', 5000, 30),
                ('wedding', 'low', 'catering', 4000, 25),
                ('wedding', 'low', 'photography', 1500, 9),
                ('wedding', 'low', 'decoration', 2000, 12),
                ('wedding', 'low', 'music', 1000, 6),
                ('wedding', 'low', 'attire', 2000, 12),
                ('wedding', 'low', 'miscellaneous', 1000, 6),
                
                ('wedding', 'medium', 'venue', 10000, 28),
                ('wedding', 'medium', 'catering', 8000, 22),
                ('wedding', 'medium', 'photography', 4000, 11),
                ('wedding', 'medium', 'decoration', 5000, 14),
                ('wedding', 'medium', 'music', 3000, 8),
                ('wedding', 'medium', 'attire', 4000, 11),
                ('wedding', 'medium', 'miscellaneous', 2000, 6),
                
                ('wedding', 'high', 'venue', 20000, 25),
                ('wedding', 'high', 'catering', 15000, 19),
                ('wedding', 'high', 'photography', 8000, 10),
                ('wedding', 'high', 'decoration', 12000, 15),
                ('wedding', 'high', 'music', 6000, 8),
                ('wedding', 'high', 'attire', 10000, 12),
                ('wedding', 'high', 'miscellaneous', 9000, 11),
                
                # Corporate events
                ('corporate', 'low', 'venue', 3000, 35),
                ('corporate', 'low', 'catering', 2500, 30),
                ('corporate', 'low', 'av_equipment', 1500, 18),
                ('corporate', 'low', 'decoration', 700, 8),
                ('corporate', 'low', 'miscellaneous', 800, 9),
                
                ('corporate', 'medium', 'venue', 8000, 32),
                ('corporate', 'medium', 'catering', 6000, 24),
                ('corporate', 'medium', 'av_equipment', 5000, 20),
                ('corporate', 'medium', 'decoration', 3000, 12),
                ('corporate', 'medium', 'miscellaneous', 3000, 12),
                
                # Birthday parties
                ('birthday', 'low', 'venue', 1000, 30),
                ('birthday', 'low', 'catering', 800, 25),
                ('birthday', 'low', 'decoration', 500, 15),
                ('birthday', 'low', 'entertainment', 400, 12),
                ('birthday', 'low', 'cake', 300, 9),
                ('birthday', 'low', 'miscellaneous', 300, 9),
                
                ('birthday', 'medium', 'venue', 3000, 30),
                ('birthday', 'medium', 'catering', 2500, 25),
                ('birthday', 'medium', 'decoration', 1500, 15),
                ('birthday', 'medium', 'entertainment', 1200, 12),
                ('birthday', 'medium', 'cake', 800, 8),
                ('birthday', 'medium', 'miscellaneous', 1000, 10)
            ]
            
            for bdata in budget_data:
                cursor.execute("""
                    INSERT INTO budget_suggestions (event_type, budget_level, category, suggested_amount, percentage)
                    VALUES (%s, %s, %s, %s, %s)
                """, bdata)
            conn.commit()
            print("✅ Default budget suggestions inserted")
        
        # Step 2: Get AI budget distribution from budget_suggestions table
        cursor.execute("""
            SELECT * FROM budget_suggestions 
            WHERE event_type = %s AND budget_level = %s
            ORDER BY percentage DESC
        """, (event_type, budget_level))
        
        ai_budget_distribution = cursor.fetchall()
        
        # If no AI suggestions found, use smart fallback distribution
        if not ai_budget_distribution:
            print(f"⚠️ No AI suggestions for {event_type}/{budget_level}, using smart distribution")
            ai_budget_distribution = generate_smart_budget_distribution(event_type, budget_level, total_budget)
        
        # Step 3: Calculate actual amounts for each category
        budget_breakdown = []
        for suggestion in ai_budget_distribution:
            amount = (suggestion['percentage'] / 100) * total_budget
            budget_breakdown.append({
                'category': suggestion['category'],
                'category_display': suggestion['category'].replace('_', ' ').title(),
                'percentage': suggestion['percentage'],
                'allocated_budget': round(amount, 2),
                'suggested_amount': suggestion['suggested_amount'],
                'importance': 'high' if suggestion['percentage'] > 15 else 'medium' if suggestion['percentage'] > 8 else 'low'
            })
        
        # Step 4: Filter categories if user selected specific ones
        if selected_categories:
            budget_breakdown = [b for b in budget_breakdown if b['category'] in selected_categories]
        
        # Step 5: Find vendors for each category based on allocated budget
        category_results = []
        
        # Ensure vendor_reviews table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                user_id INT NOT NULL,
                rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (vendor_id, user_id)
            )
        """)
        conn.commit()
        
        # Category mapping for vendor search
        category_mapping = {
            'venue': 'venue',
            'catering': 'catering',
            'photography': 'photography',
            'decoration': 'decoration',
            'music': 'music',
            'attire': 'attire',
            'av_equipment': 'av_equipment',
            'entertainment': 'entertainment',
            'cake': 'cake',
            'miscellaneous': 'other'
        }
        
        for budget_item in budget_breakdown:
            category = budget_item['category']
            allocated_budget = budget_item['allocated_budget']
            
            # Map category to service_category in vendor_profiles
            service_category = category_mapping.get(category, 'other')
            
            # Build query with filters
            query = """
                SELECT 
                    vp.id,
                    vp.user_id,
                    vp.business_name,
                    vp.service_category,
                    vp.description,
                    vp.budget_min,
                    vp.budget_max,
                    vp.contact_phone,
                    vp.email,
                    vp.full_name as owner_name,
                    u.created_at,
                    COALESCE(AVG(vr.rating), 4.0) as avg_rating,
                    COUNT(DISTINCT vr.id) as review_count,
                    CASE 
                        WHEN vp.budget_min <= %s THEN 'within_budget'
                        WHEN vp.budget_min <= %s * 1.2 THEN 'slightly_above'
                        ELSE 'above_budget'
                    END as budget_status
                FROM vendor_profiles vp
                JOIN users u ON vp.user_id = u.id
                LEFT JOIN vendor_reviews vr ON vp.user_id = vr.vendor_id
                WHERE vp.service_category = %s 
            """
            
            params = [allocated_budget, allocated_budget, service_category]
            
            query += """
                GROUP BY vp.id
                ORDER BY 
                    CASE 
                        WHEN vp.budget_min <= %s THEN 1
                        WHEN vp.budget_min <= %s * 1.2 THEN 2
                        ELSE 3
                    END,
                    avg_rating DESC,
                    vp.budget_min ASC
                LIMIT 6
            """
            
            params.extend([allocated_budget, allocated_budget])
            
            cursor.execute(query, tuple(params))
            vendors = cursor.fetchall()
            
            # Apply rating filter in Python if specified
            if min_rating > 0:
                vendors = [v for v in vendors if (v['avg_rating'] or 4.0) >= min_rating]
            
            # Format vendor data with AI insights
            formatted_vendors = []
            for vendor in vendors:
                # Calculate match score (0-100)
                match_score = calculate_match_score(
                    vendor_price_min=vendor['budget_min'] or 0,
                    allocated_budget=allocated_budget,
                    rating=vendor['avg_rating'] or 4.0
                )
                
                # Determine if this vendor is a "Great Match", "Good Match", or "Premium Option"
                if vendor['budget_min'] and vendor['budget_min'] <= allocated_budget:
                    match_type = 'great_match'
                    match_label = '🎯 Great Match'
                    match_description = 'Perfectly fits your budget'
                elif vendor['budget_min'] and vendor['budget_min'] <= allocated_budget * 1.2:
                    match_type = 'good_match'
                    match_label = '👍 Good Match'
                    match_description = 'Slightly above budget but worth it'
                else:
                    match_type = 'premium'
                    match_label = '⭐ Premium Option'
                    match_description = 'Premium service at higher price point'
                
                formatted_vendors.append({
                    'id': vendor['id'],
                    'user_id': vendor['user_id'],
                    'business_name': vendor['business_name'],
                    'service_category': vendor['service_category'],
                    'description': vendor['description'][:150] + '...' if vendor['description'] and len(vendor['description']) > 150 else vendor['description'],
                    'budget_min': float(vendor['budget_min']) if vendor['budget_min'] else 0,
                    'budget_max': float(vendor['budget_max']) if vendor['budget_max'] else 0,
                    'contact_phone': vendor['contact_phone'],
                    'email': vendor['email'],
                    'owner_name': vendor['owner_name'],
                    'rating': round(float(vendor['avg_rating']), 1) if vendor['avg_rating'] else 4.0,
                    'review_count': vendor['review_count'] or 0,
                    'match_score': match_score,
                    'match_type': match_type,
                    'match_label': match_label,
                    'match_description': match_description,
                    'budget_status': vendor['budget_status'],
                    'price_difference': round(vendor['budget_min'] - allocated_budget, 2) if vendor['budget_min'] else 0,
                    'member_since': vendor['created_at'].strftime('%b %Y') if vendor['created_at'] else 'Recently'
                })
            
            category_results.append({
                'category': category,
                'category_display': budget_item['category_display'],
                'allocated_budget': budget_item['allocated_budget'],
                'percentage': budget_item['percentage'],
                'importance': budget_item['importance'],
                'vendors': formatted_vendors,
                'vendor_count': len(formatted_vendors),
                'has_vendors': len(formatted_vendors) > 0
            })
        
        # Step 6: Get overall statistics
        total_vendors_found = sum([len(c['vendors']) for c in category_results])
        categories_with_vendors = sum([1 for c in category_results if c['has_vendors']])
        
        # Step 7: Get alternative suggestions for categories with no vendors
        categories_without_vendors = [c for c in category_results if not c['has_vendors']]
        alternative_suggestions = []
        
        if categories_without_vendors:
            for category_item in categories_without_vendors:
                category = category_item['category']
                service_category = category_mapping.get(category, 'other')
                
                # Find any vendors in this category regardless of budget
                cursor.execute("""
                    SELECT 
                        vp.business_name,
                        vp.budget_min,
                        vp.budget_max,
                        vp.service_category
                    FROM vendor_profiles vp
                    WHERE vp.service_category = %s
                    LIMIT 3
                """, (service_category,))
                
                any_vendors = cursor.fetchall()
                if any_vendors:
                    min_price = min([v['budget_min'] for v in any_vendors if v['budget_min']]) if any_vendors else 0
                    alternative_suggestions.append({
                        'category': category_item['category_display'],
                        'message': f"No vendors found within ₹{category_item['allocated_budget']:,.0f} budget",
                        'suggestion': f"Consider increasing budget for {category_item['category_display']} to ₹{min_price:,.0f}+ or check other categories",
                        'min_price': min_price
                    })
        
        cursor.close()
        conn.close()
        
        # Prepare the final response
        response = {
            'success': True,
            'event_analysis': {
                'event_type': event_type.replace('_', ' ').title(),
                'total_budget': total_budget,
                'guests': guests,
                'per_person_budget': round(per_person_budget, 2),
                'budget_level': budget_level,
                'budget_description': budget_description,
                'total_categories': len(budget_breakdown),
                'total_vendors_found': total_vendors_found,
                'categories_with_vendors': categories_with_vendors
            },
            'budget_distribution': budget_breakdown,
            'category_results': category_results,
            'alternative_suggestions': alternative_suggestions,
            'ai_insights': {
                'summary': f"Based on your ₹{total_budget:,.0f} budget for {guests} guests, we recommend a {budget_description.lower()} approach. "
                          f"We've found {total_vendors_found} vendors across {categories_with_vendors} categories that match your AI-optimized budget distribution.",
                'tip': get_budget_tip(budget_level, event_type, total_vendors_found)
            }
        }
        
        print(f"✅ AI Vendor Finder completed: Found {total_vendors_found} vendors across {len(category_results)} categories")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error in AI vendor finder: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def generate_smart_budget_distribution(event_type, budget_level, total_budget):
    """Generate a smart budget distribution when AI templates are not available"""
    
    # Default distributions for different event types
    distributions = {
        'wedding': {
            'categories': ['venue', 'catering', 'photography', 'decoration', 'music', 'attire', 'miscellaneous'],
            'low': [30, 25, 10, 12, 8, 10, 5],
            'medium': [28, 22, 11, 14, 8, 11, 6],
            'high': [25, 19, 10, 15, 8, 12, 11]
        },
        'corporate': {
            'categories': ['venue', 'catering', 'av_equipment', 'decoration', 'miscellaneous'],
            'low': [35, 30, 18, 8, 9],
            'medium': [32, 24, 20, 12, 12],
            'high': [30, 20, 24, 16, 10]
        },
        'birthday': {
            'categories': ['venue', 'catering', 'decoration', 'entertainment', 'cake', 'miscellaneous'],
            'low': [30, 25, 15, 12, 8, 10],
            'medium': [30, 25, 15, 12, 8, 10],
            'high': [32, 24, 16, 12, 6, 10]
        }
    }
    
    # Get distribution for event type or use wedding as default
    dist = distributions.get(event_type, distributions['wedding'])
    categories = dist['categories']
    percentages = dist.get(budget_level, dist['medium'])
    
    # Create suggestion objects
    suggestions = []
    for i, category in enumerate(categories):
        percentage = percentages[i] if i < len(percentages) else 5
        amount = (percentage / 100) * total_budget
        suggestions.append({
            'category': category,
            'percentage': percentage,
            'suggested_amount': amount
        })
    
    return suggestions

def calculate_match_score(vendor_price_min, allocated_budget, rating):
    """Calculate a match score (0-100) for a vendor"""
    
    # Price score (0-40 points)
    if vendor_price_min <= allocated_budget:
        price_score = 40
    elif vendor_price_min <= allocated_budget * 1.2:
        price_score = 30
    elif vendor_price_min <= allocated_budget * 1.5:
        price_score = 20
    else:
        price_score = 10
    
    # Rating score (0-40 points) - rating is 0-5, convert to 0-40
    rating_score = min(40, (rating / 5) * 40)
    
    # Value score (0-20 points) - based on how close vendor price is to budget
    if vendor_price_min > 0:
        price_ratio = min(vendor_price_min / allocated_budget, 2.0)
        value_score = max(0, 20 - ((price_ratio - 0.8) * 25))
    else:
        value_score = 15
    
    total_score = price_score + rating_score + value_score
    return round(min(100, total_score))

def get_budget_tip(budget_level, event_type, vendor_count):
    """Get AI-powered tips based on budget level"""
    
    tips = {
        'low': {
            'wedding': "For a budget-friendly wedding, consider off-peak dates and all-inclusive packages. We've found vendors that offer great value!",
            'corporate': "Maximize your corporate event budget with package deals and weekday rates.",
            'birthday': "Great choices for a memorable birthday without breaking the bank!"
        },
        'medium': {
            'wedding': "Your mid-range budget allows for quality vendors with some premium touches. Check out our top-rated matches!",
            'corporate': "Solid budget for a professional event with good amenities.",
            'birthday': "Perfect balance of quality and value for your celebration!"
        },
        'high': {
            'wedding': "With your premium budget, you can afford top-tier vendors. Check out our luxury recommendations!",
            'corporate': "Executive-level event with premium vendors and services.",
            'birthday': "Go all out with our premium vendor selections!"
        }
    }
    
    default_tip = "We've found vendors that match your AI-optimized budget distribution!"
    
    return tips.get(budget_level, {}).get(event_type, default_tip)

# Simplified vendor search for quick filtering
@app.route('/api/find-vendors/quick', methods=['POST'])
def quick_find_vendors():
    """
    Simplified vendor search for the Find Vendors tab
    Allows users to search by category, budget, and rating
    """
    try:
        data = request.json
        print("🔍 Quick vendor search:", data)
        
        category = data.get('category')
        max_budget = float(data.get('max_budget', 0))
        min_rating = float(data.get('min_rating', 0))
        search_term = data.get('search', '')
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Ensure vendor_reviews table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                user_id INT NOT NULL,
                rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (vendor_id, user_id)
            )
        """)
        conn.commit()
        
        # Build query dynamically
        query = """
            SELECT 
                vp.id,
                vp.user_id,
                vp.business_name,
                vp.service_category,
                vp.description,
                vp.budget_min,
                vp.budget_max,
                vp.contact_phone,
                vp.email,
                vp.full_name as owner_name,
                u.created_at,
                COALESCE(AVG(vr.rating), 4.0) as avg_rating,
                COUNT(DISTINCT vr.id) as review_count
            FROM vendor_profiles vp
            JOIN users u ON vp.user_id = u.id
            LEFT JOIN vendor_reviews vr ON vp.user_id = vr.vendor_id
            WHERE 1=1
        """
        params = []
        
        if category:
            query += " AND vp.service_category = %s"
            params.append(category)
        
        if max_budget > 0:
            query += " AND vp.budget_min <= %s"
            params.append(max_budget)
        
        if search_term:
            query += " AND (vp.business_name LIKE %s OR vp.description LIKE %s)"
            params.extend([f'%{search_term}%', f'%{search_term}%'])
        
        query += " GROUP BY vp.id ORDER BY avg_rating DESC, vp.budget_min ASC"
        
        cursor.execute(query, tuple(params))
        vendors = cursor.fetchall()
        
        # Apply rating filter in Python (since we can't use HAVING with the dynamic query easily)
        if min_rating > 0:
            vendors = [v for v in vendors if (v['avg_rating'] or 4.0) >= min_rating]
        
        # Format response
        formatted_vendors = []
        for vendor in vendors:
            formatted_vendors.append({
                'id': vendor['id'],
                'business_name': vendor['business_name'],
                'category': vendor['service_category'],
                'description': vendor['description'],
                'min_price': float(vendor['budget_min']) if vendor['budget_min'] else 0,
                'max_price': float(vendor['budget_max']) if vendor['budget_max'] else 0,
                'phone': vendor['contact_phone'],
                'email': vendor['email'],
                'owner_name': vendor['owner_name'],
                'rating': round(float(vendor['avg_rating']), 1) if vendor['avg_rating'] else 4.0,
                'review_count': vendor['review_count'] or 0,
                'member_since': vendor['created_at'].strftime('%b %Y') if vendor['created_at'] else 'Recently'
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'vendors': formatted_vendors,
            'count': len(formatted_vendors)
        })
        
    except Exception as e:
        print(f"Error in quick vendor search: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# VENDOR SERVICES ENDPOINTS
# ============================================

@app.route('/api/vendors/<int:user_id>/services', methods=['GET'])
def get_vendor_services(user_id):
    """Get all services for a vendor"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # First get vendor profile id
        cursor.execute("SELECT id FROM vendor_profiles WHERE user_id = %s", (user_id,))
        profile = cursor.fetchone()
        
        if not profile:
            return jsonify([])  # Return empty array if no profile
        
        vendor_id = profile['id']
        
        # Check if vendor_services table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendor_services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vendor_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                price_unit ENUM('fixed', 'per_hour', 'per_day', 'per_person') DEFAULT 'fixed',
                duration VARCHAR(50),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
        # Get services
        cursor.execute("SELECT * FROM vendor_services WHERE vendor_id = %s ORDER BY id DESC", (vendor_id,))
        services = cursor.fetchall()
        
        return jsonify(services)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors/services', methods=['POST'])
def create_vendor_service():
    """Create a new service for a vendor"""
    try:
        data = request.json
        print("📦 Received service data:", data)
        
        vendor_id = data.get('vendor_id')
        
        if not vendor_id:
            return jsonify({'error': 'vendor_id required'}), 400
        
        # Validate required fields
        if not data.get('name') or not data.get('price'):
            return jsonify({'error': 'name and price are required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = """
        INSERT INTO vendor_services 
        (vendor_id, name, description, price, price_unit, duration, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            vendor_id,
            data.get('name'),
            data.get('description'),
            data.get('price'),
            data.get('price_unit', 'fixed'),
            data.get('duration', ''),
            data.get('is_active', True)
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        service_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Service added successfully',
            'service_id': service_id
        }), 201
        
    except Exception as e:
        print(f"❌ Error adding service: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/vendors/services/<int:service_id>', methods=['DELETE'])
def delete_vendor_service(service_id):
    """Delete a vendor service"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM vendor_services WHERE id = %s", (service_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'success': True, 'message': 'Service deleted successfully'})
        else:
            return jsonify({'error': 'Service not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# INVITATION ENDPOINTS - UPDATED with user association
# ============================================

@app.route('/api/invitations', methods=['POST'])
def save_invitation():
    """Save an invitation for a specific user"""
    try:
        data = request.json
        print("=" * 50)
        print("📦 Received invitation data:", data)
        
        # Get user_id from the request
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # First, ensure the invitations table has a user_id column
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS invitations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                template_id INT,
                font_family VARCHAR(100),
                font_color VARCHAR(20),
                accent_color VARCHAR(20),
                photo_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            )
        """)
        conn.commit()
        
        # Insert invitation with user_id
        query = """
        INSERT INTO invitations (user_id, template_id, font_family, font_color, accent_color, photo_url)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        values = (
            user_id,
            data.get('template_id') or 1,
            data.get('font_family') or '',
            data.get('font_color') or '',
            data.get('accent_color') or '',
            data.get('photo_url') or ''
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        invitation_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Invitation saved successfully',
            'invitation_id': invitation_id,
            'success': True
        }), 201
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/invitations/user/<int:user_id>', methods=['GET'])
def get_user_invitations(user_id):
    """Get all invitations for a specific user"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM invitations WHERE user_id = %s ORDER BY id DESC"
        cursor.execute(query, (user_id,))
        invitations = cursor.fetchall()
        return jsonify(invitations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/invitations', methods=['GET'])
def get_all_invitations():
    """Get all invitations (admin only - careful!)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM invitations ORDER BY id DESC")
        invitations = cursor.fetchall()
        return jsonify(invitations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/invitations/<int:invitation_id>', methods=['DELETE'])
def delete_invitation(invitation_id):
    """Delete an invitation"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM invitations WHERE id = %s", (invitation_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'message': 'Invitation deleted successfully', 'success': True})
        else:
            return jsonify({'error': 'Invitation not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# NOTES ENDPOINTS
# ============================================

@app.route('/api/notes', methods=['POST'])
def save_note():
    """Save a note with checklist items"""
    try:
        data = request.json
        print("=" * 50)
        print("📦 Received note data:", data)
        
        # Validate required fields
        if not data.get('user_id'):
            return jsonify({'error': 'user_id is required'}), 400
            
        if not data.get('title'):
            return jsonify({'error': 'title is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Insert note
        note_query = """
        INSERT INTO notes (user_id, title, content)
        VALUES (%s, %s, %s)
        """
        
        note_values = (
            data.get('user_id'),
            data.get('title', ''),
            data.get('content', '')
        )
        
        print(f"📝 Inserting note: {note_values}")
        cursor.execute(note_query, note_values)
        conn.commit()
        
        note_id = cursor.lastrowid
        print(f"✅ Note saved with ID: {note_id}")
        
        # Insert checklist items if any
        checklist_items = data.get('checklist_items', [])
        print(f"📝 Checklist items received: {checklist_items}")
        
        if checklist_items and len(checklist_items) > 0:
            print(f"📝 Processing {len(checklist_items)} checklist items")
            
            checklist_query = """
            INSERT INTO checklist_items (note_id, item_text, is_completed)
            VALUES (%s, %s, %s)
            """
            
            for i, item in enumerate(checklist_items):
                # Handle different formats of checklist items
                if isinstance(item, dict):
                    item_text = item.get('text', '')
                elif isinstance(item, str):
                    item_text = item
                else:
                    item_text = str(item)
                
                print(f"  Item {i+1}: '{item_text}' for note_id {note_id}")
                
                cursor.execute(checklist_query, (note_id, item_text, 0))
            
            conn.commit()
            print(f"✅ Added {len(checklist_items)} checklist items")
            
            # Verify the checklist items were saved
            cursor.execute("SELECT COUNT(*) as count FROM checklist_items WHERE note_id = %s", (note_id,))
            result = cursor.fetchone()
            count = result[0] if result else 0
            print(f"✅ Verified {count} checklist items in database for note_id {note_id}")
        else:
            print("⚠️ No checklist items to save")
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Note saved successfully',
            'note_id': note_id,
            'success': True
        }), 201
        
    except Exception as e:
        print(f"❌ Error saving note: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/user/<int:user_id>', methods=['GET'])
def get_user_notes(user_id):
    """Get all notes for a user with their checklist items"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Get all notes for the user
        note_query = "SELECT * FROM notes WHERE user_id = %s ORDER BY id DESC"
        cursor.execute(note_query, (user_id,))
        notes = cursor.fetchall()
        
        # For each note, get its checklist items
        for note in notes:
            checklist_query = "SELECT * FROM checklist_items WHERE note_id = %s ORDER BY id"
            cursor.execute(checklist_query, (note['id'],))
            note['checklist_items'] = cursor.fetchall()
        
        print(f"✅ Found {len(notes)} notes for user {user_id}")
        return jsonify(notes)
    except Exception as e:
        print(f"❌ Error fetching notes: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note and its checklist items"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        # First delete checklist items (foreign key will handle this automatically if CASCADE is set)
        cursor.execute("DELETE FROM checklist_items WHERE note_id = %s", (note_id,))
        deleted_checklist = cursor.rowcount
        print(f"✅ Deleted {deleted_checklist} checklist items")
        
        # Then delete the note
        cursor.execute("DELETE FROM notes WHERE id = %s", (note_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({
                'message': 'Note deleted successfully', 
                'success': True,
                'deleted_checklist': deleted_checklist
            })
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        print(f"❌ Error deleting note: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# CHECKLIST ITEMS ENDPOINTS
# ============================================

@app.route('/api/checklist', methods=['POST'])
def create_checklist_item():
    """Create a checklist item"""
    try:
        data = request.json
        print("📦 Received checklist item:", data)
        
        if not data.get('note_id'):
            return jsonify({'error': 'note_id is required'}), 400
            
        if not data.get('item_text'):
            return jsonify({'error': 'item_text is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = """
        INSERT INTO checklist_items (note_id, item_text, is_completed)
        VALUES (%s, %s, %s)
        """
        
        values = (
            data.get('note_id'),
            data.get('item_text', ''),
            data.get('is_completed', 0)
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        item_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Checklist item created',
            'item_id': item_id,
            'success': True
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating checklist item: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/checklist/note/<int:note_id>', methods=['GET'])
def get_note_checklist(note_id):
    """Get all checklist items for a note"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM checklist_items WHERE note_id = %s ORDER BY id"
        cursor.execute(query, (note_id,))
        items = cursor.fetchall()
        return jsonify(items)
    except Exception as e:
        print(f"❌ Error fetching checklist: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/checklist/<int:item_id>', methods=['PUT'])
def update_checklist_item(item_id):
    """Update checklist item status"""
    try:
        data = request.json
        print(f"📦 Updating checklist item {item_id}: {data}")
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        query = "UPDATE checklist_items SET is_completed = %s WHERE id = %s"
        cursor.execute(query, (data.get('is_completed', 0), item_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Checklist item updated',
            'success': True
        })
        
    except Exception as e:
        print(f"❌ Error updating checklist item: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/checklist/<int:item_id>', methods=['DELETE'])
def delete_checklist_item(item_id):
    """Delete a checklist item"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM checklist_items WHERE id = %s", (item_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'message': 'Checklist item deleted', 'success': True})
        else:
            return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        print(f"❌ Error deleting checklist item: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    print("🚀 Starting JoyNest Backend Server...")
    print("📡 API will be available at: http://localhost:5000")
    print("📊 Database: joynest_db")
    print("=" * 50)
    print("\n🔧 Available Endpoints:")
    print("   POST /api/register - Register new user (phone now accepts country codes, password min 6 chars)")
    print("   POST /api/login - User login")
    print("   GET /api/users - Get all users")
    print("   POST /api/events - Create event")
    print("   GET /api/events/user/<id> - Get user events")
    print("   DELETE /api/events/<id> - Delete event")
    print("   POST /api/notes - Save notes with checklist")
    print("   GET /api/notes/user/<id> - Get user notes")
    print("   DELETE /api/notes/<id> - Delete note")
    print("   POST /api/invitations - Save invitation (requires user_id)")
    print("   GET /api/invitations/user/<id> - Get user invitations")
    print("   GET /api/invitations - Get all invitations (admin)")
    print("   DELETE /api/invitations/<id> - Delete invitation")
    print("   POST /api/checklist - Create checklist item")
    print("   GET /api/checklist/note/<id> - Get note checklist")
    print("   PUT /api/checklist/<id> - Update checklist item")
    print("   DELETE /api/checklist/<id> - Delete checklist item")
    print("\n📋 VENDOR ENDPOINTS:")
    print("   GET /api/vendor/profile/<user_id> - Get vendor profile")
    print("   POST /api/vendor/profile - Save/update vendor profile")
    print("   POST /api/vendor/view - Track profile view")
    print("   GET /api/vendor/bookings/<user_id> - Get vendor bookings")
    print("   POST /api/vendor/bookings - Create new booking")
    print("   PUT /api/vendor/bookings/<id> - Update booking status")
    print("   DELETE /api/vendor/bookings/<id> - Delete booking")
    print("   GET /api/all-vendors - Get all vendors")
    print("   GET /api/vendors/<user_id>/services - Get vendor services")
    print("   POST /api/vendors/services - Add new service")
    print("   DELETE /api/vendors/services/<id> - Delete service")
    print("\n🤖 AI ENDPOINTS:")
    print("   POST /api/ai/plan_event - AI event planning with vendor recommendations")
    print("   POST /api/ai-find-vendors - AI-powered vendor finder with smart budget distribution")
    print("   POST /api/find-vendors/quick - Quick vendor search with filters")
    print("=" * 50)
    app.run(debug=True, port=5000) 
    