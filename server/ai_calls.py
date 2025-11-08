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

        # Generate response using Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt + file_context
        )

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

if __name__ == "__main__":
    try:
        # Read request data from stdin
        request_data = sys.stdin.read()
        request = json.loads(request_data)
        
        # Check mode from command line args
        mode = "chat"  # default mode
        if len(sys.argv) > 2 and sys.argv[1] == "--mode":
            mode = sys.argv[2]
        
        # Process the request based on mode
        if mode == "articles":
            response = handle_article_request(request)
        elif mode == "locations":
            response = handle_location_request(request)
        else:
            response = handle_chat_request(request)
        
        # Send response back to Node.js
        print(json.dumps(response))
        
    except Exception as e:
        # Send error back to Node.js
        error_response = {
            "error": "Python processing error",
            "details": str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1)
