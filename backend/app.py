from flask import Flask
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
import os
import requests
import logging
from datetime import datetime
from routes.api_routes import register_routes

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Wake-up scheduler to keep app alive
def wake_up_app():
    try:
        app_url = os.getenv('APP_URL', 'http://localhost:5000')
        health_url = f"{app_url}/health"
        response = requests.get(health_url, timeout=9)
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

# Configure CORS
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
app.config['TWELVELABS_API_KEY_ENV'] = os.environ.get('TWELVELABS_API_KEY', '')  # Store original env value
app.config['PERPLEXITY_API_KEY'] = os.environ.get('PERPLEXITY', '')
app.config['TWELVELABS_DEFAULT_INDEX_ID'] = os.environ.get('TWELVELABS_INDEX_ID', '')

# Register routes
register_routes(app)

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