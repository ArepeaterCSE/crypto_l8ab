from flask import Flask, render_template, jsonify, request
import requests
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# إعدادات API
COINGECKO_URL = "https://api.coingecko.com/api/v3"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_crypto_data():
    try:
        # جلب أهم 100 عملة (للبداية) مع بيانات كاملة
        # العملات الأخرى يمكن جلبها بالبحث
        url = f"{COINGECKO_URL}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': 'true', # لجلب بيانات الرسم البياني الصغير
            'price_change_percentage': '24h'
        }
        r = requests.get(url, params=params, timeout=5)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search')
def search_coin():
    query = request.args.get('q', '').lower()
    if not query: return jsonify([])
    try:
        # البحث عن عملة محددة
        url = f"{COINGECKO_URL}/search?query={query}"
        r = requests.get(url, timeout=5)
        return jsonify(r.json())
    except:
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
