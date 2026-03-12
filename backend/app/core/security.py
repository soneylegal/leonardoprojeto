"""
Utilitários de segurança - Autenticação e criptografia
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import base64
import hashlib

from app.core.config import settings

# Contexto para hashing de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_fernet_key(secret: str) -> bytes:
    """Gera uma chave Fernet válida a partir de uma string"""
    key = hashlib.sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(key)


# Criptografia para chaves de API
fernet = Fernet(get_fernet_key(settings.secret_key))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Gera hash da senha"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decodifica token JWT"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


def encrypt_api_key(api_key: str) -> str:
    """Criptografa uma chave de API para armazenamento seguro"""
    return fernet.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Descriptografa uma chave de API"""
    return fernet.decrypt(encrypted_key.encode()).decode()


def mask_api_key(api_key: str) -> str:
    """Mascara uma chave de API para exibição"""
    if len(api_key) <= 8:
        return "*" * len(api_key)
    return api_key[:4] + "*" * (len(api_key) - 8) + api_key[-4:]
