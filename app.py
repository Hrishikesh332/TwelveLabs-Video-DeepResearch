from flask import Flask, request, jsonify, render_template_string, Response
from service.twelvelabs_service import TwelveLabsService
from service.sonar_service import SonarService
import os
import requests
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

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

# Default configuration
app.config['TWELVELABS_API_KEY'] = os.environ.get('TWELVELABS_API_KEY', '')
app.config['PERPLEXITY_API_KEY'] = os.environ.get('PERPLEXITY', '')

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
            'workflow_steps': 'POST /api/workflow/steps'
        }
    })

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'TwelveLabs Video DeepResearch API is running'
    })

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