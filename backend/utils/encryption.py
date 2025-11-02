from cryptography.fernet import Fernet
from django.conf import settings
import base64

def get_cipher():
    """Get Fernet cipher with encryption key"""
    key = settings.ENCRYPTION_KEY
    if not key:
        # Generate a key for development (DON'T use in production)
        key = Fernet.generate_key()
    return Fernet(key)

def encrypt_file(file_data):
    """Encrypt file data using AES-256"""
    cipher = get_cipher()
    encrypted_data = cipher.encrypt(file_data)
    return encrypted_data

def decrypt_file(encrypted_data):
    """Decrypt file data"""
    cipher = get_cipher()
    decrypted_data = cipher.decrypt(encrypted_data)
    return decrypted_data