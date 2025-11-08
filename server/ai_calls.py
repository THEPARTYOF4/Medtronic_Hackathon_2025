from google import genai
from API_KEY import API_KEY
from io import StringIO
import csv
import time
import json
import sys
client = genai.Client(api_key=API_KEY)
glossary = dict()                                                                                   

def readArticle(link):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Please read through this medical website: "+link+" and create a short list of important terms and their definitions. Return them in a csv format."
    )
    csv_data_string = response.text 

    # 1. Use StringIO to treat the string as a file
    csvfile = StringIO(csv_data_string)

    # 2. Use csv.reader to parse the data
    csv_reader = csv.reader(csvfile)

    # 3. Process the rows
    for i, row in enumerate(csv_reader):
        if i > 1 and len(row) >= 2:  # Skip header row and ensure row has at least 2 columns
            term = row[0].strip()     # First column is the term
            definition = row[1].strip()  # Second column is the definition
            addToGlossary(term, definition)  # Add to glossary using the dedicated function
    print(glossary.keys())

def addToGlossary(term, definition):
    """Add a term and its definition to the glossary if it doesn't exist"""
    if term not in glossary:  # Only add if term doesn't already exist
        glossary[term] = definition
        return True
    return False

def getGlossaryValue(term):
    """Get the definition for a term from the glossary"""
    return glossary.get(term)

def getGlossaryTerms():
    """Get all terms in the glossary"""
    return list(glossary.keys())

def searchGlossary(query):
    """Search the glossary for terms matching the query"""
    query = query.lower()
    matches = []
    for term in glossary:
        if query in term.lower() or query in glossary[term].lower():
            matches.append({
                "term": term,
                "definition": glossary[term]
            })
    return matches

def handle_chat_request(request):
    """Handle chat requests according to chat.request.json schema
    
    Args:
        request (dict): Request object containing prompt and optional file data
        
    Returns:
        dict: Response object containing AI reply and metadata
        
    Raises:
        Exception: If there's an error processing the request
    """
    try:
        prompt = request.get("prompt")
        if not prompt:
            raise ValueError("Prompt is required")
            
        file_data = request.get("file")
        metadata = request.get("metadata", {})

        # If there's a file attached, include it in the context
        file_context = ""
        if file_data:
            file_content = file_data.get("content", "")
            file_context = f"\nFile '{file_data['name']}' content: {file_content}" if file_content else ""
        
        try:
            # Generate response using Gemini
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt + file_context + "\nProvide a concise and accurate answer relevant to medical topics."
            )
        except Exception as api_error:
            print(f"Gemini API Error: {str(api_error)}", file=sys.stderr)
            raise Exception(f"Gemini API error: {str(api_error)}")

        # Get approximate token count (rough estimate based on words)
        response_text = response.text
        token_count = len(response_text.split())

        # Process medical terms if needed
        glossary_terms = []
        if metadata.get("type") == "medical":
            if metadata.get("searchGlossary"):
                # Search existing glossary
                glossary_terms = searchGlossary(prompt)
            
            if metadata.get("updateGlossary"):
                # Extract and add new medical terms
                term_extraction = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"Extract medical terms and their definitions from this text in CSV format:\n{response_text}"
                )
                
                # Process extracted terms
                csvfile = StringIO(term_extraction.text)
                csv_reader = csv.reader(csvfile)
                for i, row in enumerate(csv_reader):
                    if i > 1 and len(row) >= 2:
                        term = row[0].strip()
                        definition = row[1].strip()
                        if addToGlossary(term, definition):
                            glossary_terms.append({"term": term, "definition": definition})

        # Format response to match Express route expectations
        return {
            "reply": {
                "text": response_text,
                "tokens": token_count
            },
            "prompt": prompt,
            "fileReceived": bool(file_data),
            "id": f"chat-{int(time.time() * 1000)}",
            "glossaryTerms": glossary_terms
        }
        
    except Exception as e:
        raise Exception(f"Error processing chat request: {str(e)}")

def findArticles(topic, source_priority=None, max_results=5):
    """Find articles about a medical topic from reputable sources.
    
    Args:
        topic (str): The medical topic to search for
        source_priority (list): Priority order for source types (academic, medical, news)
        max_results (int): Maximum number of articles to return
        
    Returns:
        list: List of dicts containing article information
    """
    # Build source priority into prompt
    priority_str = ""
    if source_priority:
        priority_str = f" Prioritize these source types in order: {', '.join(source_priority)}."

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Please provide a list of {max_results} reputable medical websites where I can read about {topic}.{priority_str} For each source, provide: 1) Website Name, 2) URL, 3) Source Type (academic/medical/news), 4) Brief Description. Return in CSV format."
    )
    csv_data_string = response.text 

    # Parse CSV data
    csvfile = StringIO(csv_data_string)
    csv_reader = csv.reader(csvfile)
    
    articles = []
    for i, row in enumerate(csv_reader):
        if i > 1 and len(row) >= 4:  # Skip header, ensure all fields present
            articles.append({
                "name": row[0].strip(),
                "url": row[1].strip(),
                "sourceType": row[2].strip().lower(),
                "description": row[3].strip()
            })
    
    return articles[:max_results]  # Ensure we don't exceed max_results

def handle_article_request(request):
    """Handle article recommendation requests according to article.request.json schema
    
    Args:
        request (dict): Request object containing topic and optional metadata
        
    Returns:
        dict: Response object containing recommended articles and optional definitions
        
    Raises:
        Exception: If there's an error processing the request
    """
    try:
        topic = request.get("topic")
        if not topic:
            raise ValueError("Topic is required")
            
        metadata = request.get("metadata", {})
        max_results = metadata.get("maxResults", 5)
        source_priority = metadata.get("sourcePriority", ["medical", "academic", "news"])
        include_definitions = metadata.get("includeDefinitions", True)

        # Get article recommendations
        articles = findArticles(topic, source_priority, max_results)

        # Extract medical terms if requested
        glossary_terms = []
        if include_definitions:
            for article in articles:
                try:
                    # Extract terms from article description
                    term_extraction = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=f"Extract medical terms and their definitions from this text in CSV format:\n{article['description']}"
                    )
                    
                    # Process extracted terms
                    csvfile = StringIO(term_extraction.text)
                    csv_reader = csv.reader(csvfile)
                    for i, row in enumerate(csv_reader):
                        if i > 1 and len(row) >= 2:
                            term = row[0].strip()
                            definition = row[1].strip()
                            if addToGlossary(term, definition):
                                glossary_terms.append({"term": term, "definition": definition})
                except Exception as e:
                    print(f"Warning: Failed to extract terms from article: {str(e)}", file=sys.stderr)

        # Format response
        return {
            "topic": topic,
            "articles": articles,
            "glossaryTerms": glossary_terms,
            "id": f"articles-{int(time.time() * 1000)}"
        }
        
    except Exception as e:
        raise Exception(f"Error processing article request: {str(e)}")

def handle_location_request(request):
    """Handle location search requests according to location.request.json schema
    
    Args:
        request (dict): Request object containing search query and optional metadata
        
    Returns:
        dict: Response object containing location search results and embed URL
        
    Raises:
        Exception: If there's an error processing the request
    """
    try:
        query = request.get("query")
        if not query:
            raise ValueError("Search query is required")
            
        metadata = request.get("metadata", {})
        region = metadata.get("region", "US")
        language = metadata.get("language", "en")
        zoom = metadata.get("zoom", 13)

        # Process the query with Gemini to enhance medical location searches
        enhanced_query = query
        if any(term in query.lower() for term in ["hospital", "clinic", "doctor", "medical", "healthcare"]):
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"Enhance this medical location search query to find the most relevant results: {query}"
            )
            enhanced_query = response.text.strip()

        # Generate a unique search ID
        search_id = f"map-{int(time.time() * 1000)}"

        # Format response
        return {
            "id": search_id,
            "query": {
                "original": query,
                "enhanced": enhanced_query
            },
            "searchParams": {
                "q": enhanced_query,
                "region": region,
                "language": language,
                "zoom": zoom
            }
        }
        
    except Exception as e:
        raise Exception(f"Error processing location request: {str(e)}")

def run_chatbot_tests():
    """Run a series of tests to demonstrate chatbot functionality"""
    print("\n=== Medical Chatbot Test Suite ===\n")

    # Test 1: Basic chat functionality
    print("Test 1: Basic Medical Question")
    chat_request = {
        "prompt": "What are the common symptoms of type 2 diabetes?",
        "metadata": {
            "type": "medical",
            "searchGlossary": True,
            "updateGlossary": True
        }
    }
    try:
        response = handle_chat_request(chat_request)
        print("Chat Response:", response["reply"]["text"])
        print("Medical Terms Found:", len(response["glossaryTerms"]))
        print("\nGlossary Terms:")
        for term in response["glossaryTerms"]:
            print(f"- {term['term']}: {term['definition']}")
    except Exception as e:
        print("Error in chat test:", str(e))

    # Test 2: Article recommendations
    print("\nTest 2: Article Recommendations")
    article_request = {
        "topic": "managing diabetes diet",
        "metadata": {
            "maxResults": 3,
            "includeDefinitions": True,
            "sourcePriority": ["medical", "academic", "news"]
        }
    }
    try:
        response = handle_article_request(article_request)
        print(f"\nFound {len(response['articles'])} articles about {response['topic']}:")
        for article in response['articles']:
            print(f"\n- {article['name']}")
            print(f"  URL: {article['url']}")
            print(f"  Type: {article['sourceType']}")
            print(f"  Description: {article['description'][:100]}...")
    except Exception as e:
        print("Error in article test:", str(e))

    # Test 3: Location search
    print("\nTest 3: Medical Location Search")
    location_request = {
        "query": "endocrinologists near Charlotte NC",
        "metadata": {
            "region": "US",
            "language": "en",
            "zoom": 12
        }
    }
    try:
        response = handle_location_request(location_request)
        print("\nLocation Search Results:")
        print("Original Query:", response["query"]["original"])
        print("Enhanced Query:", response["query"]["enhanced"])
        print("Search ID:", response["id"])
        print("\nTo view the map, use these parameters:")
        for key, value in response["searchParams"].items():
            print(f"- {key}: {value}")
    except Exception as e:
        print("Error in location test:", str(e))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--mode":
        try:
            # Handle API requests from Node.js server
            request_data = sys.stdin.read()
            request = json.loads(request_data)
            
            mode = sys.argv[2] if len(sys.argv) > 2 else "chat"
            
            if mode == "articles":
                response = handle_article_request(request)
            elif mode == "locations":
                response = handle_location_request(request)
            else:
                response = handle_chat_request(request)
            
            print(json.dumps(response))
            
        except Exception as e:
            print(json.dumps({
                "error": "Python processing error",
                "details": str(e)
            }))
            sys.exit(1)
    else:
        # Run test suite when script is run directly
        run_chatbot_tests()
