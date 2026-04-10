# project/backend/db.py
import sqlite3
import json
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_PATH = "app_data.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()

    # chat_sessions table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE,
      created_at TEXT
    )
    """)

    # chat_messages table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_session_id INTEGER,
      session_id TEXT,
      message TEXT,
      response TEXT,
      message_type TEXT,
      created_at TEXT,
      FOREIGN KEY(chat_session_id) REFERENCES chat_sessions(id)
    )
    """)

    # medical_reports table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS medical_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      file_name TEXT,
      file_type TEXT,
      extracted_data TEXT,
      analysis_results TEXT,
      created_at TEXT
    )
    """)

    conn.commit()
    conn.close()

# Chat session helpers
def get_chat_session_by_session_id(session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM chat_sessions WHERE session_id = ?", (session_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None

def create_chat_session(session_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    cur.execute("INSERT OR IGNORE INTO chat_sessions (session_id, created_at) VALUES (?, ?)", (session_id, now))
    conn.commit()
    cur.execute("SELECT * FROM chat_sessions WHERE session_id = ?", (session_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row)

# Messages
def insert_chat_message(chat_session_id: int, session_id: str, message: str, response: str, message_type: str):
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    cur.execute("""
      INSERT INTO chat_messages (chat_session_id, session_id, message, response, message_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    """, (chat_session_id, session_id, message, response, message_type, now))
    conn.commit()
    conn.close()

def get_messages_by_session_id(session_id: str) -> List[Dict[str, Any]]:
    # join chat_sessions -> chat_messages
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
      SELECT m.* FROM chat_messages m
      JOIN chat_sessions s ON m.chat_session_id = s.id
      WHERE s.session_id = ?
      ORDER BY m.id ASC
    """, (session_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Medical reports
def insert_medical_report(session_id: str, file_name: str, file_type: str, extracted_data: dict, analysis_results: dict):
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    cur.execute("""
      INSERT INTO medical_reports (session_id, file_name, file_type, extracted_data, analysis_results, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    """, (session_id, file_name, file_type, json.dumps(extracted_data), json.dumps(analysis_results), now))
    conn.commit()
    conn.close()
