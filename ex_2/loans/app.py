from flask import Flask
from routes.loans import api_bp

app = Flask(__name__)
app.register_blueprint(api_bp)

@app.route('/', methods=['GET'])
def index():
    return "Welcome to the loans API. We r glad u came!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8002)