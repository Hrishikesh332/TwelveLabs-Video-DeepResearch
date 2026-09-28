import logging
import os

import requests


logger = logging.getLogger(__name__)


class SonarService:
    """Perplexity Agent API client with the app's legacy research response shape."""

    def __init__(self, api_key=None):
        if api_key is None:
            api_key = os.environ.get('PERPLEXITY_API_KEY') or os.environ.get('PERPLEXITY', '')
        self.api_key = api_key
        self.base_url = "https://api.perplexity.ai/v1/agent"

    @staticmethod
    def _extract_agent_output(data):
        content_parts = []
        search_results = []

        for item in data.get('output') or []:
            if not isinstance(item, dict):
                continue

            if item.get('type') == 'message':
                for part in item.get('content') or []:
                    if isinstance(part, dict) and part.get('type') == 'output_text':
                        content_parts.append(part.get('text', ''))
            elif item.get('type') == 'search_results':
                search_results.extend(item.get('results') or [])

        return ''.join(content_parts), search_results

    @staticmethod
    def _agent_error_message(data):
        error = data.get('error')
        if isinstance(error, dict):
            return error.get('message') or str(error)
        if error:
            return str(error)

        incomplete_details = data.get('incomplete_details')
        if isinstance(incomplete_details, dict):
            return incomplete_details.get('reason') or str(incomplete_details)
        return 'The request did not complete successfully'

    def deep_research(self, query, timeout=180):
        try:
            if not self.api_key:
                raise ValueError("API key is required")

            payload = {
                "model": "perplexity/sonar",
                "input": query,
                "tools": [{"type": "web_search"}],
                # Research in this app is citation-critical, so always ground it.
                "tool_choice": {"type": "web_search"},
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                self.base_url,
                json=payload,
                headers=headers,
                timeout=timeout,
            )

            if response.status_code != 200:
                try:
                    response_error = self._agent_error_message(response.json())
                except ValueError:
                    response_error = response.text or 'Unknown API error'
                logger.error("Perplexity Agent API returned %s: %s", response.status_code, response_error)
                return {"error": f"API request failed with status {response.status_code}: {response_error}"}

            data = response.json()
            status = data.get('status')
            if status != 'completed':
                error_message = self._agent_error_message(data)
                logger.error("Perplexity Agent API request ended with status %s: %s", status, error_message)
                return {"error": f"Agent request {status or 'failed'}: {error_message}"}

            content, search_results = self._extract_agent_output(data)
            if not content:
                return {"error": "Perplexity Agent API returned no text output"}

            # Preserve the response contract currently consumed by the frontend.
            return {
                "id": data.get('id'),
                "model": data.get('model'),
                "status": status,
                "choices": [{
                    "index": 0,
                    "finish_reason": "stop",
                    "message": {
                        "role": "assistant",
                        "content": content,
                    },
                }],
                "citations": [
                    result['url']
                    for result in search_results
                    if isinstance(result, dict) and result.get('url')
                ],
                "search_results": search_results,
                "usage": data.get('usage') or {},
            }

        except requests.exceptions.Timeout:
            logger.error("Perplexity Agent API request timed out")
            return {"error": "Request timed out - research is taking too long"}
        except requests.exceptions.RequestException as exc:
            logger.error("Perplexity Agent API network error: %s", exc)
            return {"error": f"Network error: {str(exc)}"}
        except Exception as exc:
            logger.error("Error in deep_research: %s", exc)
            return {"error": str(exc)}
