from flask import Flask, request, jsonify, render_template_string, Response
from flask_cors import CORS
from service.twelvelabs_service import TwelveLabsService
from service.sonar_service import SonarService
from service.firebase_service import FirebaseService
import os
import requests
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

# Wake-up scheduler to keep app alive
def wake_up_app():
    try:
        app_url = os.getenv('APP_URL', 'http://localhost:5000')
        health_url = f"{app_url}/health"
        response = requests.get(health_url, timeout=10)
        if response.status_code == 200:
            print(f"Successfully pinged {health_url} at {datetime.now()}")
        else:
            print(f"Failed to ping {health_url} (status code: {response.status_code}) at {datetime.now()}")
    except Exception as e:
        print(f"Error occurred while pinging app: {e}")

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(wake_up_app, 'interval', minutes=9)
scheduler.start()

app = Flask(__name__)


CORS(app, resources={
    r"/*": {  
        "origins": "*", 
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],  
        "supports_credentials": True,  
        "expose_headers": ["Content-Range", "X-Content-Range"]  
    }
})

# Default configuration
app.config['TWELVELABS_API_KEY'] = os.environ.get('TWELVELABS_API_KEY', '')
app.config['PERPLEXITY_API_KEY'] = os.environ.get('PERPLEXITY', '')

# Initialize Firebase service
firebase_service = FirebaseService()

def firebase_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        id_token = auth_header.split('Bearer ')[1]
        verification_result = firebase_service.verify_id_token(id_token)
        
        if not verification_result['success']:
            return jsonify({'error': verification_result['error']}), 401
        
        # Add user info to request context
        request.current_user = verification_result['user']
        return f(*args, **kwargs)
    
    return decorated_function

@app.route('/')
def index():
    return jsonify({
        'status': 'healthy',
        'message': 'TwelveLabs Video DeepResearch API',
        'version': '1.0.0',
        'endpoints': {
            'indexes': 'POST /api/indexes',
            'videos': 'POST /api/videos',
            'video_details': 'POST /api/video/<index_id>/<video_id>',
            'analyze': 'POST /api/analyze/<video_id>',
            'sonar_research': 'POST /api/sonar/research',
            'sonar_research_stream': 'POST /api/sonar/research/stream',
            'workflow': 'POST /api/workflow',
            'workflow_steps': 'POST /api/workflow/steps',
            'auth': {
                'verify_token': 'POST /api/auth/verify',
                'user_profile': 'GET /api/auth/user',
                'logout': 'POST /api/auth/logout'
            }
        }
    })

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'TwelveLabs Video DeepResearch API is running'
    })

@app.route('/api/config/twelvelabs', methods=['POST'])
def set_twelvelabs_config():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        # Test the API key by trying to fetch indexes
        service = TwelveLabsService(api_key=api_key)
        test_result = service.get_indexes()
        
        if isinstance(test_result, list):
            # API key is valid, store it in app config
            app.config['TWELVELABS_API_KEY'] = api_key
            return jsonify({
                'success': True,
                'message': 'TwelveLabs API key configured successfully',
                'indexes': test_result
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid API key: Failed to fetch indexes'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error configuring API key: {str(e)}'
        }), 500

@app.route('/api/config/twelvelabs', methods=['GET'])
def get_twelvelabs_config():
    try:
        api_key = app.config.get('TWELVELABS_API_KEY')
        if api_key:
            # Mask the API key for security
            masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "***"
            return jsonify({
                'success': True,
                'configured': True,
                'api_key': masked_key
            })
        else:
            return jsonify({
                'success': True,
                'configured': False
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error getting API key configuration: {str(e)}'
        }), 500

@app.route('/api/config/twelvelabs', methods=['DELETE'])
def clear_twelvelabs_config():
    try:
        app.config['TWELVELABS_API_KEY'] = ''
        return jsonify({
            'success': True,
            'message': 'TwelveLabs API key cleared successfully'
        })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error clearing API key configuration: {str(e)}'
        }), 500



@app.route('/api/indexes', methods=['POST'])
def get_indexes():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        # Create service with provided API key
        service = TwelveLabsService(api_key=api_key)
        indexes = service.get_indexes()
        
        return jsonify({
            'success': True,
            'indexes': indexes
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/videos', methods=['POST'])
def get_videos():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        index_id = data.get('index_id')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        if not index_id:
            return jsonify({'success': False, 'error': 'Index ID is required'}), 400
        
        # Create service with provided API key
        service = TwelveLabsService(api_key=api_key)
        videos = service.get_videos(index_id)
        
        return jsonify({
            'success': True,
            'videos': videos
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/video/<index_id>/<video_id>', methods=['POST'])
def get_video_details(index_id, video_id):
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        # Create service with provided API key
        service = TwelveLabsService(api_key=api_key)
        video_details = service.get_video_details(index_id, video_id)
        
        if video_details:
            return jsonify({
                'success': True,
                'video_details': video_details
            })
        else:
            return jsonify({'success': False, 'error': 'Video not found or access denied'}), 404
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analyze/<video_id>', methods=['POST'])
def analyze_video(video_id):
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        prompt = data.get('prompt')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        if not prompt:
            return jsonify({'success': False, 'error': 'Prompt is required'}), 400
        
        # Create service with provided API key
        service = TwelveLabsService(api_key=api_key)
        analysis = service.analyze_video(video_id, prompt)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sonar/research', methods=['POST'])
def sonar_research():
    try:
        data = request.get_json()
        api_key = data.get('api_key') or app.config['PERPLEXITY_API_KEY']
        query = data.get('query')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        if not query:
            return jsonify({'success': False, 'error': 'Query is required'}), 400
        
        # Create service with provided API key or from environment
        service = SonarService(api_key=api_key)
        result = service.deep_research(query)
        
        if 'error' in result:
            return jsonify({'success': False, 'error': result['error']}), 500
        
        return jsonify({
            'success': True,
            'research': result
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sonar/research/stream', methods=['POST'])
def sonar_research_stream():

    try:
        data = request.get_json()
        api_key = data.get('api_key') or app.config['PERPLEXITY_API_KEY']
        query = data.get('query')
        
        if not api_key:
            return jsonify({'success': False, 'error': 'API key is required'}), 400
        
        if not query:
            return jsonify({'success': False, 'error': 'Query is required'}), 400
        
        # Create service with provided API key or from environment
        service = SonarService(api_key=api_key)
        
        def generate():
            for chunk in service.deep_research_stream(query):
                yield chunk
        
        return Response(generate(), mimetype='text/plain')
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/workflow', methods=['POST'])
def complete_workflow():
    
    try:
        data = request.get_json()
        twelvelabs_api_key = data.get('twelvelabs_api_key')
        index_id = data.get('index_id')
        video_id = data.get('video_id')
        analysis_prompt = data.get('analysis_prompt', 'Describe what happens in this video')
        research_query = data.get('research_query')
        
        # Validate required parameters
        if not twelvelabs_api_key:
            return jsonify({'success': False, 'error': 'TwelveLabs API key is required'}), 400
        
        if not index_id:
            return jsonify({'success': False, 'error': 'Index ID is required'}), 400
        
        if not video_id:
            return jsonify({'success': False, 'error': 'Video ID is required'}), 400
        
        if not research_query:
            return jsonify({'success': False, 'error': 'Research query is required'}), 400
        
        # Step 1 - Get video details from TwelveLabs
        twelvelabs_service = TwelveLabsService(api_key=twelvelabs_api_key)
        video_details = twelvelabs_service.get_video_details(index_id, video_id)
        
        if not video_details:
            return jsonify({'success': False, 'error': 'Could not retrieve video details'}), 404
        
        # Step 2 - Analyze the video
        try:
            analysis_result = twelvelabs_service.analyze_video(video_id, analysis_prompt)
        except Exception as e:
            return jsonify({'success': False, 'error': f'Video analysis failed: {str(e)}'}), 500
        
        # Step 3 - Conduct deep research using Sonar
        sonar_service = SonarService()
        research_result = sonar_service.deep_research(research_query)
        
        if 'error' in research_result:
            return jsonify({'success': False, 'error': f'Sonar research failed: {research_result["error"]}'}), 500

        return jsonify({
            'success': True,
            'workflow': {
                'video_details': video_details,
                'analysis': analysis_result,
                'research': research_result
            },
            'summary': {
                'video_id': video_id,
                'index_id': index_id,
                'analysis_prompt': analysis_prompt,
                'research_query': research_query
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/workflow/steps', methods=['POST'])
def workflow_steps():

    try:
        data = request.get_json()
        step = data.get('step')
        twelvelabs_api_key = data.get('twelvelabs_api_key')
        
        # Only require TwelveLabs API key for steps that need it
        if step in ['get_indexes', 'get_videos', 'analyze_video'] and not twelvelabs_api_key:
            return jsonify({'success': False, 'error': 'TwelveLabs API key is required'}), 400
        
        if step in ['get_indexes', 'get_videos', 'analyze_video']:
            twelvelabs_service = TwelveLabsService(api_key=twelvelabs_api_key)
        
        if step == 'get_indexes':
            # Step 1 - Get all indexes
            indexes = twelvelabs_service.get_indexes()
            return jsonify({
                'success': True,
                'step': 'indexes',
                'data': indexes,
                'next_step': 'select_index'
            })
        
        elif step == 'get_videos':
            # Step 2 - Get videos from selected index
            index_id = data.get('index_id')
            if not index_id:
                return jsonify({'success': False, 'error': 'Index ID is required'}), 400
            
            videos = twelvelabs_service.get_videos(index_id)
            return jsonify({
                'success': True,
                'step': 'videos',
                'data': videos,
                'index_id': index_id,
                'next_step': 'select_video'
            })
        
        elif step == 'analyze_video':
            # Step 3 - Analyze selected video
            video_id = data.get('video_id')
            analysis_prompt = data.get('analysis_prompt', 'Describe what happens in this video')
            
            if not video_id:
                return jsonify({'success': False, 'error': 'Video ID is required'}), 400
            
            try:
                analysis_result = twelvelabs_service.analyze_video(video_id, analysis_prompt)
                return jsonify({
                    'success': True,
                    'step': 'analysis',
                    'data': analysis_result,
                    'video_id': video_id,
                    'next_step': 'sonar_research'
                })
            except Exception as e:
                return jsonify({'success': False, 'error': f'Video analysis failed: {str(e)}'}), 500
        
        elif step == 'sonar_research':
            # Step 4 - Conduct deep research
            research_query = data.get('research_query')
            if not research_query:
                return jsonify({'success': False, 'error': 'Research query is required'}), 400
            
            sonar_service = SonarService()
            research_result = sonar_service.deep_research(research_query)
            
            if 'error' in research_result:
                return jsonify({'success': False, 'error': f'Sonar research failed: {research_result["error"]}'}), 500
            
            return jsonify({
                'success': True,
                'step': 'research',
                'data': research_result,
                'next_step': 'complete'
            })
        
        elif step == 'sonar_research_stream':
            # Step 4: Conduct deep research with streaming
            research_query = data.get('research_query')
            if not research_query:
                return jsonify({'success': False, 'error': 'Research query is required'}), 400
            
            sonar_service = SonarService()
            
            def generate():
                for chunk in sonar_service.deep_research_stream(research_query):
                    yield chunk
            
            return Response(generate(), mimetype='text/plain')
        
        else:
            return jsonify({'success': False, 'error': 'Invalid step. Available steps: get_indexes, get_videos, analyze_video, sonar_research, sonar_research_stream'}), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Firebase Authentication Routes
@app.route('/api/auth/verify', methods=['POST'])
def verify_firebase_token():
    try:
        data = request.get_json()
        id_token = data.get('id_token')
        
        if not id_token:
            return jsonify({'error': 'ID token is required'}), 400
        
        verification_result = firebase_service.verify_id_token(id_token)
        
        if verification_result['success']:
            return jsonify({
                'success': True,
                'user': verification_result['user'],
                'message': 'Token verified successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': verification_result['error']
            }), 401
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/user', methods=['GET'])
@firebase_auth_required
def get_user_profile():
    try:
        user = request.current_user
        
        # Get additional user details from Firebase
        user_details = firebase_service.get_user_by_uid(user['uid'])
        
        if user_details['success']:
            return jsonify({
                'success': True,
                'user': user_details['user']
            })
        else:
            return jsonify({
                'success': False,
                'error': user_details['error']
            }), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
@firebase_auth_required
def logout_user():
    try:
        user = request.current_user
        uid = user['uid']
        
        # Revoke all refresh tokens for the user
        revoke_result = firebase_service.revoke_refresh_tokens(uid)
        
        if revoke_result['success']:
            return jsonify({
                'success': True,
                'message': 'User logged out successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': revoke_result['error']
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/create-custom-token', methods=['POST'])
def create_custom_token():
    try:
        data = request.get_json()
        uid = data.get('uid')
        additional_claims = data.get('additional_claims', {})
        
        if not uid:
            return jsonify({'error': 'UID is required'}), 400
        
        token_result = firebase_service.create_custom_token(uid, additional_claims)
        
        if token_result['success']:
            return jsonify({
                'success': True,
                'token': token_result['token']
            })
        else:
            return jsonify({
                'success': False,
                'error': token_result['error']
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    try:
        print("Starting TwelveLabs Video DeepResearch API...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\nShutting down...")
        scheduler.shutdown()
        print("Scheduler stopped")
    except Exception as e:
        print(f"Error starting app: {e}")
        scheduler.shutdown() 