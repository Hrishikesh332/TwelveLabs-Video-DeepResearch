import requests
import os
import json

class SonarService:
    
    def __init__(self, api_key=None):
        if api_key is None:
            api_key = os.environ.get('PERPLEXITY', '')
        self.api_key = api_key
        self.base_url = "https://api.perplexity.ai/chat/completions"
    
    def deep_research(self, query):
        """
        Conduct deep research using Perplexity AI's Sonar model
        
        Args:
            query (str): The research query to analyze
            
        Returns:
            dict: The response from the Sonar API
        """
        try:
            if not self.api_key:
                raise ValueError("API key is required")
            
            payload = {
                "model": "sonar-deep-research",
                "messages": [
                    {"role": "user", "content": query}
                ]
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(self.base_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return {"error": f"API request failed with status {response.status_code}"}
                
        except Exception as e:
            print(f"Error in deep_research: {e}")
            return {"error": str(e)}
    
    def deep_research_stream(self, query):
        """
        Conduct deep research using Perplexity AI's Sonar model with streaming
        
        Args:
            query (str): The research query to analyze
            
        Yields:
            str: Streaming content chunks
        """
        try:
            if not self.api_key:
                raise ValueError("API key is required")
            
            payload = {
                "model": "sonar-deep-research",
                "messages": [
                    {"role": "user", "content": query}
                ],
                "stream": True
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(self.base_url, json=payload, headers=headers, stream=True)
            
            if response.status_code != 200:
                print(f"Error: {response.status_code} - {response.text}")
                yield f"data: {json.dumps({'error': f'API request failed with status {response.status_code}'})}\n\n"
                return
            
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data_str = line[6:]  # Remove 'data: ' prefix
                        if data_str == '[DONE]':
                            yield f"data: {json.dumps({'done': True})}\n\n"
                            break
                        try:
                            chunk_data = json.loads(data_str)
                            content = chunk_data['choices'][0]['delta'].get('content', '')
                            if content:
                                yield f"data: {json.dumps({'content': content})}\n\n"
                        except json.JSONDecodeError:
                            continue
                
        except Exception as e:
            print(f"Error in deep_research_stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n" 