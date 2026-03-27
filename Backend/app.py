import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import hashlib
import re
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-this-in-production')

# CORS - allow frontend URLs
CORS(app, origins=[
    'https://joynest-frontend.vercel.app',
    'https://joynest-frontend-git-main.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
])

# Database configuration from environment variables
db_config = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'joynest_db')
}

# Translations dictionary
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
        'designer': 'Designer'
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
        'designer': 'डिजाइनर'
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
        'designer': 'Diseñador'
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

# ============================================
# TEST ENDPOINTS
# ============================================

@app.route('/api/test', methods=['GET'])
def test_db():
    """Test database connection"""
    conn = get_db_connection()
    if conn:
        return jsonify({'status': 'Database connected successfully!'})
    else:
        return jsonify({'status': 'Database connection failed'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'JoyNest API is running!'})

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({'message': 'JoyNest API is running!', 'status': 'success'})

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
        cursor.execute("SELECT id, username, email, full_name, phone, is_vendor, created_at FROM users")
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
    data = request.json
    print("📦 Registration data:", data)
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    password = data.get('password', '')
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'User already exists'}), 409
        
        # Hash password
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        # Determine if user is vendor
        is_vendor = 1 if data.get('userType') == 'vendor' else 0
        
        # Insert user
        query = """
        INSERT INTO users (username, email, password, full_name, phone, is_vendor)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        username = data.get('username', data['email'].split('@')[0])
        full_name = data.get('fullName', '')
        phone = data.get('phone', '')
        
        values = (username, data['email'], password_hash, full_name, phone, is_vendor)
        cursor.execute(query, values)
        conn.commit()
        
        user_id = cursor.lastrowid
        
        # If vendor, create vendor profile
        if is_vendor == 1:
            # Create vendor_profiles table if not exists
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
                    city VARCHAR(100),
                    address TEXT,
                    latitude DECIMAL(10,8),
                    longitude DECIMAL(11,8),
                    views INT DEFAULT 0,
                    bookings_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            conn.commit()
            
            vendor_query = """
            INSERT INTO vendor_profiles 
            (user_id, business_name, full_name, email, service_category, 
             budget_min, budget_max, contact_phone, username, description, city, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            vendor_values = (
                user_id,
                data.get('businessName', ''),
                data.get('fullName', ''),
                data.get('email', ''),
                data.get('serviceCategory', ''),
                data.get('budgetMin', 0),
                data.get('budgetMax', 0),
                phone,
                username,
                data.get('description', ''),
                data.get('city', ''),
                data.get('address', '')
            )
            cursor.execute(vendor_query, vendor_values)
            conn.commit()
        
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
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
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
            if user['is_vendor']:
                cursor.execute("SELECT * FROM vendor_profiles WHERE user_id = %s", (user['id'],))
                vendor_data = cursor.fetchone()
                if vendor_data:
                    user['businessName'] = vendor_data['business_name']
                    user['serviceCategory'] = vendor_data['service_category']
                    user['city'] = vendor_data['city']
            
            user['user_type'] = 'vendor' if user['is_vendor'] else 'planner'
            user['fullName'] = user['full_name']
            return jsonify({'message': 'Login successful', 'user': user})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# VENDOR ENDPOINTS
# ============================================

@app.route('/api/all-vendors', methods=['GET'])
def get_all_vendors():
    """Get all vendors with optional city filter"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        service_type = request.args.get('service_type', '')
        city = request.args.get('city', '')
        
        query = """
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
            vp.city,
            vp.address,
            vp.views,
            vp.bookings_count,
            u.created_at as member_since
        FROM vendor_profiles vp
        JOIN users u ON vp.user_id = u.id
        WHERE 1=1
        """
        
        params = []
        
        if service_type:
            query += " AND vp.service_category = %s"
            params.append(service_type)
        
        if city and city != '':
            query += " AND vp.city = %s"
            params.append(city)
        
        query += " ORDER BY vp.created_at DESC"
        
        cursor.execute(query, tuple(params))
        vendors = cursor.fetchall()
        
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
                'city': vendor['city'] or 'Not specified',
                'address': vendor['address'],
                'views': vendor['views'] or 0,
                'bookings_count': vendor['bookings_count'] or 0,
                'member_since': vendor['member_since'].strftime('%b %Y') if vendor['member_since'] else 'Recently',
                'rating': 4.5
            })
        
        return jsonify(formatted_vendors)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify([]), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendors/cities', methods=['GET'])
def get_vendor_cities():
    """Get all unique cities"""
    conn = get_db_connection()
    if not conn:
        return jsonify([]), 500
    
    cursor = conn.cursor()
    try:
        query = """
        SELECT DISTINCT city 
        FROM vendor_profiles 
        WHERE city IS NOT NULL AND city != '' 
        ORDER BY city
        """
        cursor.execute(query)
        results = cursor.fetchall()
        cities = [row[0] for row in results]
        
        if len(cities) == 0:
            cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad']
        
        return jsonify(cities)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify([]), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendor/profile/<int:user_id>', methods=['GET'])
def get_vendor_profile(user_id):
    """Get vendor profile by user ID"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM vendor_profiles WHERE user_id = %s", (user_id,))
        profile = cursor.fetchone()
        
        if profile:
            return jsonify(profile)
        else:
            return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/vendor/profile', methods=['POST'])
def save_vendor_profile():
    """Save or update vendor profile"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Check if profile exists
        cursor.execute("SELECT id FROM vendor_profiles WHERE user_id = %s", (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            query = """
            UPDATE vendor_profiles 
            SET business_name=%s, full_name=%s, email=%s, service_category=%s, 
                budget_min=%s, budget_max=%s, contact_phone=%s, username=%s, 
                description=%s, city=%s, address=%s
            WHERE user_id=%s
            """
            values = (
                data.get('businessName'), data.get('fullName'), data.get('email'),
                data.get('serviceCategory'), data.get('budgetMin'), data.get('budgetMax'),
                data.get('contactPhone'), data.get('username'), data.get('description'),
                data.get('city', ''), data.get('address', ''),
                user_id
            )
            cursor.execute(query, values)
            message = 'Profile updated successfully'
        else:
            query = """
            INSERT INTO vendor_profiles 
            (user_id, business_name, full_name, email, service_category, 
             budget_min, budget_max, contact_phone, username, description, city, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                user_id, data.get('businessName'), data.get('fullName'), data.get('email'),
                data.get('serviceCategory'), data.get('budgetMin'), data.get('budgetMax'),
                data.get('contactPhone'), data.get('username'), data.get('description'),
                data.get('city', ''), data.get('address', '')
            )
            cursor.execute(query, values)
            message = 'Profile created successfully'
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': message}), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# EVENT ENDPOINTS
# ============================================

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event"""
    try:
        data = request.json
        
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
            data.get('date', ''),
            data.get('time', ''),
            data.get('location', ''),
            data.get('guests', 0),
            data.get('budget', 0),
            data.get('description', '')
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        event_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Event created successfully', 'event_id': event_id, 'success': True}), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/events/user/<int:user_id>', methods=['GET'])
def get_user_events(user_id):
    """Get all events for a user"""
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
# INVITATION ENDPOINTS
# ============================================

@app.route('/api/invitations', methods=['POST'])
def save_invitation():
    """Save an invitation"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
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
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
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
        
        return jsonify({'message': 'Invitation saved successfully', 'invitation_id': invitation_id, 'success': True}), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/invitations/user/<int:user_id>', methods=['GET'])
def get_user_invitations(user_id):
    """Get all invitations for a user"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM invitations WHERE user_id = %s ORDER BY id DESC", (user_id,))
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
        
        if not data.get('user_id') or not data.get('title'):
            return jsonify({'error': 'user_id and title are required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Create notes table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
        # Create checklist_items table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS checklist_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                note_id INT NOT NULL,
                item_text VARCHAR(255) NOT NULL,
                is_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        
        # Insert note
        note_query = """
        INSERT INTO notes (user_id, title, content)
        VALUES (%s, %s, %s)
        """
        cursor.execute(note_query, (data['user_id'], data['title'], data.get('content', '')))
        conn.commit()
        
        note_id = cursor.lastrowid
        
        # Insert checklist items
        checklist_items = data.get('checklist_items', [])
        for item in checklist_items:
            item_text = item.get('text', '') if isinstance(item, dict) else str(item)
            if item_text:
                cursor.execute(
                    "INSERT INTO checklist_items (note_id, item_text) VALUES (%s, %s)",
                    (note_id, item_text)
                )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Note saved successfully', 'note_id': note_id, 'success': True}), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/user/<int:user_id>', methods=['GET'])
def get_user_notes(user_id):
    """Get all notes for a user"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM notes WHERE user_id = %s ORDER BY id DESC", (user_id,))
        notes = cursor.fetchall()
        
        for note in notes:
            cursor.execute("SELECT * FROM checklist_items WHERE note_id = %s ORDER BY id", (note['id'],))
            note['checklist_items'] = cursor.fetchall()
        
        return jsonify(notes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM notes WHERE id = %s", (note_id,))
        conn.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'message': 'Note deleted successfully', 'success': True})
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

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
        
        cursor.execute("""
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
        """, (user_id,))
        bookings = cursor.fetchall()
        
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
        
        return jsonify(formatted_bookings)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============================================
# AI ENDPOINTS
# ============================================

@app.route('/api/ai/plan_event', methods=['POST'])
def ai_plan_event():
    """AI event planning endpoint"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        current_lang = data.get('language', 'en')
        
        # Simple AI response
        response = f"""
        <div class="ai-plan">
            <h3>📋 Event Planning Guide</h3>
            <div class="plan-step">
                <div class="step-number">1</div>
                <div>
                    <strong>Based on: "{prompt}"</strong>
                    <p>Here's a basic event plan to get you started!</p>
                </div>
            </div>
            <div class="plan-step">
                <div class="step-number">2</div>
                <div>
                    <strong>Key Steps:</strong>
                    <ul>
                        <li>Define your event goals and theme</li>
                        <li>Create a guest list and budget</li>
                        <li>Choose a suitable date and venue</li>
                        <li>Plan the event timeline</li>
                        <li>Arrange necessary vendors</li>
                    </ul>
                </div>
            </div>
        </div>
        """
        
        return jsonify({
            'status': 'success',
            'plan_html': response,
            'response': 'AI plan generated successfully!'
        }), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================
# START SERVER
# ============================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)