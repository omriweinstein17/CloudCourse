from flask import Flask
from flask_pymongo import PyMongo
from routes.api import api_bp
from routes.loans import mongo as loans_mongo

app = Flask(__name__)
app.register_blueprint(api_bp)

#connect to the mongodb database
app.config["MONGO_URI"] = "mongodb://mongo:27017/LoansDB"
mongo = PyMongo(app)
loans_mongo.init_app(app)

@app.route('/', methods=['GET'])
def index():
    return "Welcome to the loans API. We r glad u came!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=80)