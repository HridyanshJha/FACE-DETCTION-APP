import sqlite3
from datetime import datetime
import json

class Database:
    def __init__(self):
        self.db_file = 'face_detection.db'
        self.init_database()

    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        # Create detections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                face_data TEXT,
                timestamp DATETIME,
                emotion TEXT,
                age TEXT,
                gender TEXT,
                confidence FLOAT
            )
        ''')

        # Create detection_logs table for statistics
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detection_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME,
                processing_time FLOAT,
                faces_detected INTEGER,
                success BOOLEAN
            )
        ''')

        conn.commit()
        conn.close()

    def save_detection(self, face_data, emotion, age, gender, confidence):
        """Save a face detection entry"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO detections (face_data, timestamp, emotion, age, gender, confidence)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            json.dumps(face_data),
            datetime.now().isoformat(),
            emotion,
            age,
            gender,
            confidence
        ))

        conn.commit()
        conn.close()

    def log_detection(self, processing_time, faces_detected, success=True):
        """Log detection statistics"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO detection_logs (timestamp, processing_time, faces_detected, success)
            VALUES (?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            processing_time,
            faces_detected,
            success
        ))

        conn.commit()
        conn.close()

    def get_recent_detections(self, limit=10):
        """Get recent face detections"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM detections
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))

        detections = cursor.fetchall()
        conn.close()

        return [
            {
                'id': d[0],
                'face_data': json.loads(d[1]),
                'timestamp': d[2],
                'emotion': d[3],
                'age': d[4],
                'gender': d[5],
                'confidence': d[6]
            }
            for d in detections
        ]

    def get_detection_stats(self, days=7):
        """Get detection statistics for the dashboard"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        # Get total detections for the period
        cursor.execute('''
            SELECT 
                COUNT(*) as total_detections,
                AVG(confidence) as avg_confidence,
                AVG(processing_time) as avg_processing_time
            FROM detection_logs
            WHERE timestamp >= datetime('now', '-? days')
        ''', (days,))

        stats = cursor.fetchone()

        # Get daily detection counts
        cursor.execute('''
            SELECT 
                date(timestamp) as date,
                COUNT(*) as count
            FROM detection_logs
            WHERE timestamp >= datetime('now', '-? days')
            GROUP BY date(timestamp)
            ORDER BY date
        ''', (days,))

        daily_counts = cursor.fetchall()
        conn.close()

        return {
            'total_detections': stats[0],
            'avg_confidence': round(stats[1] or 0, 2),
            'avg_processing_time': round(stats[2] or 0, 3),
            'daily_counts': [
                {'date': date, 'count': count}
                for date, count in daily_counts
            ]
        }

    def update_settings(self, settings):
        """Save detection settings"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        # Create settings table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')

        # Update settings
        for key, value in settings.items():
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value)
                VALUES (?, ?)
            ''', (key, json.dumps(value)))

        conn.commit()
        conn.close()

    def get_settings(self):
        """Get current detection settings"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        cursor.execute('SELECT key, value FROM settings')
        settings = dict(cursor.fetchall())
        conn.close()

        return {
            key: json.loads(value)
            for key, value in settings.items()
        } 