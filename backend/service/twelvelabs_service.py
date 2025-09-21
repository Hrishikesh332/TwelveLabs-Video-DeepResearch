from twelvelabs import TwelveLabs
import requests
import sys
import os

class TwelveLabsService:
    
    def __init__(self, api_key=None):
        if api_key is None:
            api_key = os.environ.get('TWELVELABS_API_KEY', '')
        self.api_key = api_key
        self.client = TwelveLabs(api_key=api_key)
    
    def get_indexes(self):
        try:
            print("Fetching indexes...")
            if not self.api_key:
                print("No API key available")
                return []
            
            # Use TwelveLabs client to get indexes
            indexes = self.client.indexes.list()
            
            result = []
            for index in indexes:
                result.append({
                    "id": index.id,
                    "name": index.index_name
                })
                print(f"ID: {index.id}")
                print(f"  Name: {index.index_name}")
            
            return result
        except Exception as e:
            print(f"Error fetching indexes: {e}")
            return []
    
    def get_videos(self, index_id, page=1):
        try:
            if not self.api_key:
                print("No API key available")
                return []
            
            # Use TwelveLabs client to get videos
            videos_response = self.client.indexes.videos.list(index_id=index_id, page=page)
            
            result = []
            for video in videos_response.items:
                system_metadata = video.system_metadata
                hls_data = video.hls
                thumbnail_urls = hls_data.get('thumbnail_urls', []) if hls_data else []
                thumbnail_url = thumbnail_urls[0] if thumbnail_urls else None
                video_url = hls_data.get('video_url') if hls_data else None
                
                result.append({
                    "id": video.id,
                    "name": system_metadata.filename if system_metadata and system_metadata.filename else f'Video {video.id}',
                    "duration": system_metadata.duration if system_metadata else 0,
                    "thumbnail_url": thumbnail_url,
                    "video_url": video_url,
                    "width": system_metadata.width if system_metadata else 0,
                    "height": system_metadata.height if system_metadata else 0,
                    "fps": system_metadata.fps if system_metadata else 0,
                    "size": system_metadata.size if system_metadata else 0
                })
            
            return result
        except Exception as e:
            print(f"Error fetching videos for index {index_id}: {e}")
            return []
    
    def analyze_video(self, video_id, prompt):
        try:
            analysis_response = self.client.analyze(
                video_id=video_id,
                prompt=prompt
            )
            return analysis_response.data
        except Exception as e:
            print(f"Error analyzing video {video_id}: {e}")
            raise e

    def get_video_details(self, index_id, video_id):
        if not hasattr(self, 'client') or not getattr(self, 'client', None):
            return None
        if not self.api_key:
            return None
        url = f"https://api.twelvelabs.io/v1.3/indexes/{index_id}/videos/{video_id}?embed=false"
        headers = {
            "accept": "application/json",
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to get video details: Status {response.status_code}")
                return None
        except Exception as e:
            print(f"Exception getting video details: {str(e)}")
            return None

    def get_video_thumbnail(self, index_id, video_id):
        if not hasattr(self, 'client') or not getattr(self, 'client', None):
            print("[DEBUG] No client available", file=sys.stderr)
            return None
        if not self.api_key:
            print("[DEBUG] No API key available", file=sys.stderr)
            return None
        url = f"https://api.twelvelabs.io/v1.3/indexes/{index_id}/videos/{video_id}/thumbnail"
        headers = {
            "accept": "application/json",
            "x-api-key": self.api_key
        }
        try:
            response = requests.get(url, headers=headers)
            print(f"[DEBUG] Thumbnail endpoint content-type: {response.headers.get('Content-Type')}", file=sys.stderr)
            if response.status_code != 200:
                print(f"[DEBUG] Thumbnail endpoint returned status {response.status_code}: {response.text}", file=sys.stderr)
                return None
            data = response.json()
            if not isinstance(data, dict) or 'thumbnail' not in data:
                print(f"[DEBUG] Unexpected thumbnail response: {data}", file=sys.stderr)
                return None
            thumbnail_url = data.get('thumbnail')
            print(f"[DEBUG] Extracted thumbnail URL: {thumbnail_url}", file=sys.stderr)
            if thumbnail_url:
                img_resp = requests.get(thumbnail_url)
                print(f"[DEBUG] Image fetch status: {img_resp.status_code}", file=sys.stderr)
                if img_resp.status_code == 200:
                    print(f"[DEBUG] Image fetch successful, bytes: {len(img_resp.content)}", file=sys.stderr)
                    return img_resp.content
                else:
                    print(f"[DEBUG] Failed to fetch actual thumbnail image: {img_resp.status_code}", file=sys.stderr)
                    return None
            else:
                print("[DEBUG] No thumbnail URL in JSON response", file=sys.stderr)
                return None
        except Exception as e:
            print(f"[DEBUG] Exception getting thumbnail: {str(e)}", file=sys.stderr)
            return None

    def upload_video_file(self, index_id: str, file_path: str, timeout_seconds: int = 900):

        import sys
        try:
            if not self.api_key:
                return {"error": "Missing TwelveLabs API key"}
            if not index_id:
                return {"error": "Missing index_id"}
            if not os.path.exists(file_path):
                return {"error": f"File not found: {file_path}"}
            
            print(f"[DEBUG] Starting upload for file: {file_path}", file=sys.stderr)

            tasks_url = "https://api.twelvelabs.io/v1.3/tasks"
            headers = {
                "x-api-key": self.api_key
            }

            # Create upload task
            with open(file_path, "rb") as f:
                files = {
                    "video_file": (os.path.basename(file_path), f)
                }
                data = {
                    "index_id": index_id
                }
                resp = requests.post(tasks_url, headers=headers, files=files, data=data)

            if resp.status_code not in (200, 201):
                return {"error": f"Failed to create upload task: {resp.status_code} {resp.text}"}

            resp_json = resp.json() if resp.text else {}
            task_id = resp_json.get("id") or resp_json.get("task_id") or resp_json.get("_id")
            if not task_id:
                return {"error": f"No task id returned: {resp_json}"}

            # Poll task until ready
            import time
            start_time = time.time()
            print(f"[DEBUG] Starting to poll task {task_id} for completion...", file=sys.stderr)
            
            while time.time() - start_time < timeout_seconds:
                r = requests.get(f"{tasks_url}/{task_id}", headers=headers)
                if r.status_code != 200:
                    time.sleep(2)
                    continue
                task = r.json() if r.text else {}
                status = task.get("status")
                print(f"[DEBUG] Task {task_id} status: {status}", file=sys.stderr)
                
                if status in ("ready", "completed"):
                    video_id = task.get("video_id") or (task.get("data") or {}).get("video_id")
                    print(f"[DEBUG] Indexing completed successfully! Video ID: {video_id}", file=sys.stderr)
                    return {"status": status, "video_id": video_id, "task": task}
                if status in ("failed", "error"):
                    print(f"[DEBUG] Indexing failed with status: {status}", file=sys.stderr)
                    return {"error": f"Indexing failed with status {status}", "task": task}
                time.sleep(2)

            print(f"[DEBUG] Upload timed out after {timeout_seconds} seconds", file=sys.stderr)
            return {"error": "Upload timed out"}
        except Exception as e:
            return {"error": str(e)} 