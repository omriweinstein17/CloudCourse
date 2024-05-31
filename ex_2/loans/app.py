from flask import Flask, jsonify, request
from pymongo import MongoClient
import os
from routes.loans import loans_bp

app = Flask(__name__)
app.register_blueprint(loans_bp)

#connect to the mongodb database
mongo_uri = os.getenv('MONGODB_URI', "mongodb+srv://galtrodel:fxeQJc8Kms8NncXa@cluster0.runjg3c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(mongo_uri)
db = client['myDB'] # Assuming the database name is 'myDB', check that out
loans_collection = db['loans']

@app.route('/', methods=['GET'])
def index():
    return "Welcome to the loans API. We r glad u came!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8000)