# TwelveLabs-Video-DeepResearch

### Prerequisites

- Python 3.7 or higher
- TwelveLabs API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TwelveLabs-Video-DeepResearch
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your API key (optional):
```bash
export TWELVELABS_API_KEY="your-api-key-here"
```

## Usage

### Running the Application

1. Start the Flask application:
```bash
python app.py
```

2. Open your browser and navigate to `http://localhost:5000`

3. Enter your TwelveLabs API key in the web interface

### API Endpoints

#### Web Interface
- `GET /` - Main web interface for interacting with the API

#### REST API Endpoints

1. **Get Indexes**
   ```
   POST /api/indexes
   Content-Type: application/json
   
   {
     "api_key": "your-twelvelabs-api-key"
   }
   ```

2. **Get Videos from Index**
   ```
   POST /api/videos
   Content-Type: application/json
   
   {
     "api_key": "your-twelvelabs-api-key",
     "index_id": "index-id-here"
   }
   ```

3. **Get Video Details**
   ```
   POST /api/video/<index_id>/<video_id>
   Content-Type: application/json
   
   {
     "api_key": "your-twelvelabs-api-key"
   }
   ```

4. **Analyze Video**
   ```
   POST /api/analyze/<video_id>
   Content-Type: application/json
   
   {
     "api_key": "your-twelvelabs-api-key",
     "prompt": "Describe what happens in this video"
   }
   ```

### Example Usage

#### Using curl

1. Get all indexes:
```bash
curl -X POST http://localhost:5000/api/indexes \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-api-key"}'
```

2. Get videos from an index:
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-api-key", "index_id": "index-id"}'
```

3. Analyze a video:
```bash
curl -X POST http://localhost:5000/api/analyze/video-id \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-api-key", "prompt": "What is happening in this video?"}'
```
