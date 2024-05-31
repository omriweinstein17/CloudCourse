from flask import Flask
from flask_pymongo import PyMongo # flask_pymongo
from .routes.routes import api_bp
from .routes.loans import mongo as loans_mongo

app = Flask(_name_)
app.config["MONGO_URL"] = "mongodb://mongodb:27017/LoansDB"
mongo = PyMongo(app)
loans_mongo.init_app(app)

app.register_blueprint(api_bp)

@app.route('/', methods=['GET'])
def index():
    return "Welcome to the Loan Service API!"

if _name_ == '_main_':
    app.run(host='0.0.0.0', debug=True, port=8000)