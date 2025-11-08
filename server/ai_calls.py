from google import genai
from API_KEY import API_KEY
from io import StringIO
import csv
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
    if term not in glossary:  # Only add if term doesn't already exist
        glossary[term] = definition

def getGlossaryValue(term):
    return glossary.get(term)

def findArticles(topic):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Please provide a list of reputable medical websites where I can read about "+topic+". Return them in a csv format with two columns: Website Name, URL."
    )
    csv_data_string = response.text 

    # 1. Use StringIO to treat the string as a file
    csvfile = StringIO(csv_data_string)

    # 2. Use csv.reader to parse the data
    csv_reader = csv.reader(csvfile)

    articles = []
    # 3. Process the rows
    for i, row in enumerate(csv_reader):
        if i > 1 and len(row) >= 2:  # Skip header row and ensure row has at least 2 columns
            website_name = row[0].strip()     # First column is the website name
            url = row[1].strip()  # Second column is the URL
            articles.append((website_name, url))
    return articles

if __name__ == "__main__":
    #response = client.models.generate_content(
     #   model="gemini-2.5-flash",
      #  contents="In medical terms, tell me about acid reflux" 
    #)
    #print(response.text)
    readArticle("https://www.webmd.com/heartburn-gerd/what-is-acid-reflux-disease")
    print(getGlossaryValue("GERD"))
    articles = findArticles("acid reflux")
    for article in articles:
        print("Website Name:", article[0])
        print("URL:", article[1])
        print("---")
        readArticle(article[1])
    print()
