from flask import jsonify, request, Response
from datetime import datetime
import json
import logging
import os
from service.twelvelabs_service import TwelveLabsService
from service.sonar_service import SonarService

logger = logging.getLogger(__name__)

def load_prompt_from_file(filename):
    """Load a prompt template from a markdown file in the instructions folder."""
    try:
        # Get the directory where this file is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        instructions_dir = os.path.join(current_dir, '..', 'instructions')
        prompt_file = os.path.join(instructions_dir, filename)
        
        if not os.path.exists(prompt_file):
            logger.error(f"Prompt file not found: {prompt_file}")
            return None
            
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        logger.info(f"Loaded prompt from {filename}")
        return content
        
    except Exception as e:
        logger.error(f"Error loading prompt from {filename}: {str(e)}")
        return None


def safe_json_dumps(obj):

    try:
        json_str = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
        # Validate that we can parse it back (double-check)
        json.loads(json_str)
        return json_str
    except (TypeError, ValueError, json.JSONDecodeError) as e:
        logger.error(f"JSON serialization error: {e}")
        logger.error(f"Problematic object type: {type(obj)}")
        logger.error(f"Object keys (if dict): {list(obj.keys()) if isinstance(obj, dict) else 'Not a dict'}")
        
        # Return a safe fallback
        return json.dumps({
            'type': 'error',
            'message': f'Failed to serialize response data: {str(e)}'
        })

def register_routes(app):
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
                'workflow_streaming': 'POST /api/workflow/streaming'
            }
        })

    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'message': 'TwelveLabs Video DeepResearch API is running',
            'version': '1.0.1'  # Updated version to confirm deployment
        })

    @app.route('/api/config/twelvelabs', methods=['POST'])
    def set_twelvelabs_config():
        try:
            data = request.get_json()
            api_key = data.get('api_key')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required.'}), 400
            
            # Test the API key by trying to fetch indexes
            service = TwelveLabsService(api_key=api_key)
            test_result = service.get_indexes()
            
            if isinstance(test_result, list):
                # API key is valid, return success without storing it server-side
                return jsonify({
                    'success': True,
                    'message': 'TwelveLabs API key validated successfully',
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
                'error': f'Error validating API key: {str(e)}'
            }), 500

    @app.route('/api/config/twelvelabs', methods=['GET'])
    def get_twelvelabs_config():
        try:
            # Only return environment API key status, not user-specific keys
            env_api_key = app.config.get('TWELVELABS_API_KEY_ENV')
            if env_api_key:
                return jsonify({
                    'success': True,
                    'configured': True,
                    'environment_key_available': True
                })
            else:
                return jsonify({
                    'success': True,
                    'configured': False,
                    'environment_key_available': False
                })
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error getting API key configuration: {str(e)}'
            }), 500

    @app.route('/api/config/twelvelabs', methods=['DELETE'])
    def clear_twelvelabs_config():
        try:
            # This endpoint now just confirms the client should use environment key
            return jsonify({
                'success': True,
                'message': 'Switched to environment API key mode'
            })
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error switching to environment key: {str(e)}'
            }), 500

    @app.route('/api/indexes', methods=['POST'])
    def get_indexes():
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
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
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            index_id = data.get('index_id')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
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

    @app.route('/api/upload', methods=['POST'])
    def upload_video():
        try:
            # Always use environment API key for uploads to maintain consistency
            api_key = app.config.get('TWELVELABS_API_KEY_ENV')
            default_index_id = app.config.get('TWELVELABS_DEFAULT_INDEX_ID')
            if not api_key:
                return jsonify({'success': False, 'error': 'TwelveLabs API key not configured in environment'}), 400
            if not default_index_id:
                return jsonify({'success': False, 'error': 'Default index id not configured in environment (TWELVELABS_INDEX_ID)'}), 400
            
            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            upload_file = request.files['file']
            if not upload_file or upload_file.filename == '':
                return jsonify({'success': False, 'error': 'Invalid file'}), 400
            
            import tempfile
            import os
            tmp_file = tempfile.NamedTemporaryFile(delete=False)
            tmp_file_path = tmp_file.name
            tmp_file.close()
            upload_file.save(tmp_file_path)
            
            logger.info(f"Temporary file created: {tmp_file_path}")
            
            try:
                service = TwelveLabsService(api_key=api_key)
                logger.info("Starting video upload and indexing...")
                result = service.upload_video_file(index_id=default_index_id, file_path=tmp_file_path)
                logger.info(f"Upload and indexing completed with result: {result}")
            finally:
                # Clean up temporary file after indexing is complete (or failed)
                try:
                    if os.path.exists(tmp_file_path):
                        os.remove(tmp_file_path)
                        logger.info(f"Temporary file deleted: {tmp_file_path}")
                    else:
                        logger.warning(f"Temporary file not found for deletion: {tmp_file_path}")
                except Exception as e:
                    logger.error(f"Failed to delete temporary file {tmp_file_path}: {str(e)}")
            
            if 'error' in result:
                return jsonify({'success': False, 'error': result['error'], 'task': result.get('task')}), 400
            
            return jsonify({'success': True, 'video_id': result.get('video_id'), 'status': result.get('status')})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/video/<index_id>/<video_id>', methods=['POST'])
    def get_video_details(index_id, video_id):
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            video_details = service.get_video_details(index_id, video_id)
            
            if video_details:
                return jsonify({
                    'success': True,
                    'video_details': video_details
                })
            else:
                return jsonify({'success': False, 'error': 'Video not found or access denied'}), 400
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/analyze/<video_id>', methods=['POST'])
    def analyze_video(video_id):
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            prompt = data.get('prompt')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
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
            api_key = data.get('api_key') or app.config.get('PERPLEXITY_API_KEY')
            query = data.get('query')
            
            if not api_key:
                return jsonify({
                    'success': False, 
                    'error': 'API key is required. Please check your environment configuration.'
                }), 401
            
            if not query:
                return jsonify({'success': False, 'error': 'Query is required'}), 400
            
            # Create service with provided API key
            service = SonarService(api_key=api_key)
            result = service.deep_research(query)
            
            if isinstance(result, dict) and 'error' in result:
                logger.error(f"Sonar research error: {result['error']}")
                return jsonify({
                    'success': False, 
                    'error': result['error']
                }), 500
            
            return jsonify({
                'success': True,
                'research': result
            })
            
        except Exception as e:
            logger.error(f"Error in sonar research: {str(e)}")
            return jsonify({
                'success': False, 
                'error': f"Research failed: {str(e)}"
            }), 500


    # @app.route('/api/sonar/research/stream', methods=['POST'])
    # def sonar_research_stream():
    #     try:
    #         data = request.get_json()
    #         api_key = data.get('api_key') or app.config.get('PERPLEXITY_API_KEY')
    #         query = data.get('query')
            
    #         if not api_key:
    #             return jsonify({
    #                 'success': False, 
    #                 'error': 'API key is required. Please check your environment configuration.'
    #             }), 401
            
    #         if not query:
    #             return jsonify({'success': False, 'error': 'Query is required'}), 400
            
    #         # Create service with provided API key
    #         service = SonarService(api_key=api_key)
            
    #         def generate():
    #             try:
    #                 for chunk in service.deep_research_stream(query):
    #                     yield chunk
    #             except Exception as e:
    #                 logger.error(f"Error in streaming research: {str(e)}")
    #                 yield json.dumps({
    #                     'type': 'error',
    #                     'message': str(e)
    #                 }) + '\n'
            
    #         return Response(generate(), mimetype='text/event-stream')
            
    #     except Exception as e:
    #         logger.error(f"Error setting up research stream: {str(e)}")
    #         return jsonify({
    #             'success': False, 
    #             'error': f"Research stream failed: {str(e)}"
    #         }), 500

    @app.route('/api/workflow', methods=['POST'])
    def complete_workflow():
        # Load prompts from markdown files first
        default_analysis_prompt = load_prompt_from_file('video_analysis_prompt.md')
        if not default_analysis_prompt:
            default_analysis_prompt = 'Describe what happens in this video'
        
        research_prompt_template = load_prompt_from_file('research_prompt.md')
        if not research_prompt_template:
            research_prompt_template = """Based on this video analysis: {analysis_result}

Please research: {research_query}

IMPORTANT: Please provide a comprehensive research response using proper markdown formatting including:
- Use ## for main headings and ### for subheadings
- If table, then proper mardkown table format

Provide comprehensive insights with clear structure and professional formatting."""
        
        try:
            data = request.get_json()
            logger.info(f"=== WORKFLOW REQUEST START ===")
            logger.info(f"Request data: {json.dumps(data, indent=2)}")
            
            # Try client API key first, then fall back to environment
            twelvelabs_api_key = data.get('twelvelabs_api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            index_id = data.get('index_id')
            video_id = data.get('video_id')
            
            analysis_prompt = data.get('analysis_prompt', default_analysis_prompt)
            research_query = data.get('research_query')

            def generate():
                # Initial validation
                logger.info(f"Starting workflow for video {video_id} in index {index_id}")
                
                if not twelvelabs_api_key:
                    yield json.dumps({
                        'type': 'error',
                        'message': 'TwelveLabs API key is required'
                    }) + '\n'
                    return

                if not index_id or not video_id:
                    yield json.dumps({
                        'type': 'error',
                        'message': 'Index ID and Video ID are required'
                    }) + '\n'
                    return

                if not research_query:
                    yield json.dumps({
                        'type': 'error',
                        'message': 'Research query is required'
                    }) + '\n'
                    return

                try:
                    # Step 1: Get video details
                    yield safe_json_dumps({
                        'type': 'progress',
                        'step': 'video_details',
                        'message': 'Fetching video details...',
                        'progress': 0
                    }) + '\n'

                    twelvelabs_service = TwelveLabsService(api_key=twelvelabs_api_key)
                    video_details = twelvelabs_service.get_video_details(index_id, video_id)

                    if not video_details:
                        yield safe_json_dumps({
                            'type': 'error',
                            'message': 'Could not retrieve video details'
                        }) + '\n'
                        return

                    yield safe_json_dumps({
                        'type': 'data',
                        'step': 'video_details',
                        'data': video_details,
                        'progress': 33
                    }) + '\n'

                    # Step 2: Analyze video
                    yield safe_json_dumps({
                        'type': 'progress',
                        'step': 'analysis',
                        'message': 'Analyzing video content...',
                        'progress': 33
                    }) + '\n'

                    analysis_result = twelvelabs_service.analyze_video(video_id, analysis_prompt)
                    
                    yield safe_json_dumps({
                        'type': 'data',
                        'step': 'analysis',
                        'data': analysis_result,
                        'progress': 66
                    }) + '\n'

                    # Step 3: Research with context
                    yield safe_json_dumps({
                        'type': 'progress',
                        'step': 'research',
                        'message': 'Conducting deep research...',
                        'progress': 66
                    }) + '\n'

                    # Create research query with markdown formatting request using pre-loaded template
                    enhanced_query = research_prompt_template.format(
                        analysis_result=analysis_result,
                        research_query=research_query
                    )
                    
                    sonar_service = SonarService()
                    research_result = sonar_service.deep_research(enhanced_query, timeout=180)

                    if 'error' in research_result:
                        yield safe_json_dumps({
                            'type': 'error',
                            'message': f'Research failed: {research_result["error"]}'
                        }) + '\n'
                        return

                    # Send final result in smaller chunks to avoid large JSON issues
                    try:
                        # First, send the research content separately in manageable pieces
                        research_content = ""
                        if research_result and research_result.get('choices'):
                            research_content = research_result['choices'][0].get('message', {}).get('content', '')
                        
                        # Send research content in chunks if it's large
                        max_chunk_size = 8000  # 8KB chunks
                        if len(research_content) > max_chunk_size:
                            total_chunks = (len(research_content) + max_chunk_size - 1) // max_chunk_size
                            logger.info(f"Large research content ({len(research_content)} chars), sending in {total_chunks} chunks")
                            
                            # Send research content in multiple chunks
                            for i in range(0, len(research_content), max_chunk_size):
                                chunk = research_content[i:i + max_chunk_size]
                                chunk_index = i // max_chunk_size
                                is_final_chunk = (i + max_chunk_size) >= len(research_content)
                                
                                chunk_data = {
                                    'type': 'research_chunk',
                                    'content': chunk,
                                    'chunk_index': chunk_index,
                                    'is_final': is_final_chunk,
                                    'total_length': len(research_content),
                                    'total_chunks': total_chunks
                                }
                                
                                chunk_json = safe_json_dumps(chunk_data)
                                logger.info(f"Sending chunk {chunk_index + 1}/{total_chunks} ({len(chunk_json)} chars)")
                                yield chunk_json + '\n'
                        
                        # Send the complete response with minimal research data
                        final_response = {
                            'type': 'complete',
                            'data': {
                                'video_details': video_details,
                                'analysis': analysis_result,
                                'research': {
                                    'choices': [{
                                        'message': {
                                            'content': research_content if len(research_content) <= max_chunk_size else f"[CHUNKED_CONTENT]"
                                        }
                                    }],
                                    'citations': research_result.get('citations', [])[:20],  # Limit citations
                                    'usage': research_result.get('usage', {})
                                },
                                'sources': research_result.get('search_results', [])[:15]  # Limit sources
                            },
                            'progress': 100
                        }
                        
                        # Test the size and send
                        response_json = safe_json_dumps(final_response)
                        if len(response_json) > 30000:  # Still too large, send minimal version
                            logger.warning(f"Response still large ({len(response_json)} chars), sending minimal version")
                            minimal_response = {
                                'type': 'complete',
                                'data': {
                                    'video_details': {
                                        '_id': video_details.get('_id', ''),
                                        'system_metadata': {
                                            'filename': video_details.get('system_metadata', {}).get('filename', ''),
                                            'duration': video_details.get('system_metadata', {}).get('duration', 0)
                                        }
                                    },
                                    'analysis': analysis_result[:1000] + "..." if len(str(analysis_result)) > 1000 else analysis_result,
                                    'research': {
                                        'choices': [{
                                            'message': {
                                                'content': research_content if len(research_content) <= max_chunk_size else "[Content sent in chunks]"
                                            }
                                        }],
                                        'citations': research_result.get('citations', [])[:5]
                                    },
                                    'sources': research_result.get('search_results', [])[:5]
                                },
                                'progress': 100
                            }
                            yield safe_json_dumps(minimal_response) + '\n'
                        else:
                            yield response_json + '\n'
                            
                    except Exception as json_error:
                        logger.error(f"Error serializing final response: {json_error}")
                        yield safe_json_dumps({
                            'type': 'error',
                            'message': f'Failed to serialize research results: {str(json_error)}'
                        }) + '\n'

                except Exception as e:
                    logger.error(f"Error in workflow: {str(e)}")
                    yield safe_json_dumps({
                        'type': 'error',
                        'message': str(e)
                    }) + '\n'

            return Response(generate(), mimetype='text/event-stream', headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'  # Disable nginx buffering
            })

        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

#     @app.route('/api/workflow/streaming', methods=['POST'])
#     def streaming_workflow():
#         try:
#             data = request.get_json()
#             logger.info(f"=== STREAMING WORKFLOW REQUEST START ===")
#             logger.info(f"Request data: {json.dumps(data, indent=2)}")
            
#             twelvelabs_api_key = data.get('twelvelabs_api_key') or app.config['TWELVELABS_API_KEY']
#             index_id = data.get('index_id')
#             video_id = data.get('video_id')
#             analysis_prompt = data.get('analysis_prompt', 'Describe what happens in this video')
#             research_query = data.get('research_query')
            
#             logger.info(f"Streaming workflow parameters:")
#             logger.info(f"  - Index ID: {index_id}")
#             logger.info(f"  - Video ID: {video_id}")
#             logger.info(f"  - Analysis Prompt: {analysis_prompt}")
#             logger.info(f"  - Research Query: {research_query}")
            
#             if not twelvelabs_api_key or twelvelabs_api_key == '':
#                 logger.error("Missing TwelveLabs API key in streaming workflow")
#                 return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
#             if not research_query:
#                 logger.error("Missing Research Query in streaming workflow")
#                 return jsonify({'success': False, 'error': 'Research query is required'}), 400
            
#             def generate():
#                 # Step 1 - Get video details
#                 yield f"data: {json.dumps({'step': 'video_details', 'message': 'Fetching video details...'})}\n\n"
                
#                 try:
#                     twelvelabs_service = TwelveLabsService(api_key=twelvelabs_api_key)
#                     if index_id and video_id:
#                         video_details = twelvelabs_service.get_video_details(index_id, video_id)
#                         yield f"data: {json.dumps({'step': 'video_details', 'data': video_details})}\n\n"
#                 except Exception as e:
#                     yield f"data: {json.dumps({'step': 'video_details', 'error': str(e)})}\n\n"
                
#                 # Step 2 - Analyze video (if video_id provided)
#                 if video_id:
#                     yield f"data: {json.dumps({'step': 'analysis', 'message': 'Analyzing video content...'})}\n\n"
#                     try:
#                         analysis_result = twelvelabs_service.analyze_video(video_id, analysis_prompt)
#                         yield f"data: {json.dumps({'step': 'analysis', 'data': analysis_result})}\n\n"
#                     except Exception as e:
#                         yield f"data: {json.dumps({'step': 'analysis', 'error': str(e)})}\n\n"
                
#                 # Step 3 - Conduct deep research with TwelveLabs analysis
#                 yield f"data: {json.dumps({'step': 'research', 'message': 'Conducting deep research based on video analysis...'})}\n\n"
                
#                 sonar_service = SonarService()
#                 try:
#                     # Create research query that includes the video analysis
#                     if 'analysis_result' in locals() and analysis_result:
#                         enhanced_query = f"""
# Based on this video analysis: {analysis_result}

# Please research: {research_query}

# Provide comprehensive insights that connect the video content with current trends, developments, and relevant information.
# """
#                     else:
#                         enhanced_query = research_query
                    
#                     for chunk in sonar_service.deep_research_stream(enhanced_query, timeout=45):
#                         yield chunk
#                 except Exception as e:
#                     yield f"data: {json.dumps({'step': 'research', 'error': str(e)})}\n\n"
                
#                 # Step 4 - Complete
#                 yield f"data: {json.dumps({'step': 'complete', 'message': 'Workflow completed!'})}\n\n"
            
#             return Response(generate(), mimetype='text/plain')
            
#         except Exception as e:
#             return jsonify({'success': False, 'error': str(e)}), 500 


