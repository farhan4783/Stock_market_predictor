from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Add src to path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_loader import fetch_stock_data
from preprocessing import add_technical_indicators, inverse_transform_predictions
from model import load_trained_model
from train import train_model
from sentiment import get_market_sentiment


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_prediction_data(ticker, days_ahead):
    """
    Logic adapted from predict.py to return data instead of printing/plotting.
    """
    try:
        # Load metadata
        # Load metadata
        metadata_path = f"models/{ticker}_metadata.json"
        
        # Auto-train if model doesn't exist
        if not os.path.exists(metadata_path):
            print(f"⚠️ Model for {ticker} not found. Starting auto-training...")
            try:
                # Train with default parameters
                train_model(ticker=ticker, epochs=20) # Lower epochs for speed
            except Exception as e:
                return None, f"Failed to auto-train model: {str(e)}"
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)

        
        sequence_length = metadata['sequence_length']
        num_features = metadata['num_features']
        
        # Load model and scaler
        model = load_trained_model(f"models/{ticker}_best_model.h5")
        scaler = joblib.load(f"models/{ticker}_scaler.pkl")
        
        # Fetch recent data
        df = fetch_stock_data(ticker, period="1y")
        df = add_technical_indicators(df)
        
        # Prepare features
        feature_columns = ['Close', 'Volume', 'SMA_20', 'SMA_50', 'EMA_12', 
                          'EMA_26', 'RSI', 'MACD', 'MACD_Signal']
        data = df[feature_columns].values
        
        # Scale data
        scaled_data = scaler.transform(data)
        
        # Get the last sequence for prediction
        last_sequence = scaled_data[-sequence_length:]
        
        # Make predictions
        predictions = []
        current_sequence = last_sequence.copy()
        
        for i in range(days_ahead):
            X_pred = current_sequence.reshape(1, sequence_length, num_features)
            pred_scaled = model.predict(X_pred, verbose=0)
            predictions.append(pred_scaled[0, 0])
            
            if i < days_ahead - 1:
                new_row = current_sequence[-1].copy()
                new_row[0] = pred_scaled[0, 0]
                current_sequence = np.vstack([current_sequence[1:], new_row])
        
        # Inverse transform
        predictions = np.array(predictions)
        predictions_original = inverse_transform_predictions(predictions, scaler, num_features)
        
        # Prepare response data
        current_price = df['Close'].iloc[-1]
        if isinstance(current_price, pd.Series):
            current_price = current_price.iloc[0]
        current_price = float(current_price)
        
        last_date = df['Date'].iloc[-1]
        if isinstance(last_date, pd.Series):
            last_date = last_date.iloc[0]
        last_date = pd.to_datetime(last_date)
        
        future_data = []
        for i, price in enumerate(predictions_original):
            date = last_date + timedelta(days=i+1)
            future_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "price": float(price),
                "change_percent": ((price - current_price) / current_price) * 100
            })
            
        # Historical data for chart (last 60 days)
        historical_data = []
        hist_df = df.tail(60)
        for _, row in hist_df.iterrows():
            date_val = row['Date']
            if isinstance(date_val, pd.Series):
                date_val = date_val.iloc[0]
            
            close_val = row['Close']
            if isinstance(close_val, pd.Series):
                close_val = close_val.iloc[0]
                
            historical_data.append({
                "date": pd.to_datetime(date_val).strftime('%Y-%m-%d'),
                "open": float(row['Open']) if not isinstance(row['Open'], pd.Series) else float(row['Open'].iloc[0]),
                "high": float(row['High']) if not isinstance(row['High'], pd.Series) else float(row['High'].iloc[0]),
                "low": float(row['Low']) if not isinstance(row['Low'], pd.Series) else float(row['Low'].iloc[0]),
                "close": float(close_val), # Already handled above
                "volume": int(row['Volume']) if not isinstance(row['Volume'], pd.Series) else int(row['Volume'].iloc[0])
            })

        return {
            "ticker": ticker,
            "current_price": current_price,
            "predictions": future_data,
            "historical": historical_data,
            "metadata": metadata
        }, None

    except Exception as e:
        return None, str(e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    ticker = data.get('ticker', 'AAPL')
    days = int(data.get('days', 7))
    
    result, error = get_prediction_data(ticker, days)
    
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify(result)

@app.route('/sentiment', methods=['POST'])
def sentiment():
    data = request.get_json()
    ticker = data.get('ticker', 'AAPL')
    
    try:
        result = get_market_sentiment(ticker)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
