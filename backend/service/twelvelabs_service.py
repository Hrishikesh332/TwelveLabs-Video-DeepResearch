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
            # Use direct HTTP request
            if not self.api_key:
                print("No API key available")
                return []
            
            url = "https://api.twelvelabs.io/v1.3/indexes"
            headers = {
                "accept": "application/json",
                "x-api-key": self.api_key
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                result = []
                for index in data.get('data', []):
                    result.append({
                        "id": index['_id'],
                        "name": index['index_name']
                    })
                return result
            else:
                print(f"Failed to fetch indexes: Status {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching indexes: {e}")
            return []
    
    def get_videos(self, index_id):
        try:
            # Use direct HTTP request to get videos
            if not self.api_key:
                print("No API key available")
                return []
            
            url = f"https://api.twelvelabs.io/v1.3/indexes/{index_id}/videos"
            headers = {
                "accept": "application/json",
                "x-api-key": self.api_key
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                result = []
                for video in data.get('data', []):
                    system_metadata = video.get('system_metadata', {})
                    hls_data = video.get('hls', {})
                    thumbnail_urls = hls_data.get('thumbnail_urls', [])
                    thumbnail_url = thumbnail_urls[0] if thumbnail_urls else None
                    video_url = hls_data.get('video_url')
                    
                    result.append({
                        "id": video['_id'],
                        "name": system_metadata.get('filename', f'Video {video["_id"]}'),
                        "duration": system_metadata.get('duration', 0),
                        "thumbnail_url": thumbnail_url,
                        "video_url": video_url
                    })
                return result
            else:
                print(f"Failed to fetch videos: Status {response.status_code}")
                return []
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