import firebase_admin
from firebase_admin import credentials, auth
import os
import json

class FirebaseService:
    def __init__(self):
        self.firebase_app = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Path to Firebase credentials
                firebase_creds_path = os.path.join(os.path.dirname(__file__), '/', 'etc', 'secrets', 'firebase.json')
                
                if os.path.exists(firebase_creds_path):
                    # Initialize Firebase with service account key
                    cred = credentials.Certificate(firebase_creds_path)
                    self.firebase_app = firebase_admin.initialize_app(cred)
                    print("Firebase Admin SDK initialized successfully")
                else:
                    print("Firebase credentials file not found")
            else:
                self.firebase_app = firebase_admin.get_app()
                print("Firebase Admin SDK already initialized")
                
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
    
    def verify_id_token(self, id_token):

        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            
            # Extract user information
            user_info = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture'),
                'firebase': decoded_token.get('firebase', {}),
                'auth_time': decoded_token.get('auth_time'),
                'exp': decoded_token.get('exp')
            }
            
            return {
                'success': True,
                'user': user_info
            }
            
        except auth.InvalidIdTokenError:
            return {
                'success': False,
                'error': 'Invalid ID token'
            }
        except auth.ExpiredIdTokenError:
            return {
                'success': False,
                'error': 'Token has expired'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Token verification failed: {str(e)}'
            }
    
    def get_user_by_uid(self, uid):

        try:
            user_record = auth.get_user(uid)
            
            user_info = {
                'uid': user_record.uid,
                'email': user_record.email,
                'email_verified': user_record.email_verified,
                'display_name': user_record.display_name,
                'photo_url': user_record.photo_url,
                'phone_number': user_record.phone_number,
                'disabled': user_record.disabled,
                'creation_timestamp': user_record.user_metadata.creation_timestamp,
                'last_sign_in_timestamp': user_record.user_metadata.last_sign_in_timestamp
            }
            
            return {
                'success': True,
                'user': user_info
            }
            
        except auth.UserNotFoundError:
            return {
                'success': False,
                'error': 'User not found'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error retrieving user: {str(e)}'
            }
    
    def create_custom_token(self, uid, additional_claims=None):
        """
        Create a custom token for a user
        
        Args:
            uid (str): Firebase user UID
            additional_claims (dict): Additional claims to include in token
            
        Returns:
            dict: Custom token or error
        """
        try:
            custom_token = auth.create_custom_token(uid, additional_claims)
            
            return {
                'success': True,
                'token': custom_token.decode('utf-8')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error creating custom token: {str(e)}'
            }
    
    def revoke_refresh_tokens(self, uid):

        try:
            auth.revoke_refresh_tokens(uid)
            
            return {
                'success': True,
                'message': 'Refresh tokens revoked successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error revoking tokens: {str(e)}'
            } 