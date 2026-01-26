"""
Prediction Module
Makes predictions using the trained LSTM model
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_loader import fetch_stock_data
from preprocessing import add_technical_indicators, inverse_transform_predictions
from model import load_trained_model


def predict_stock_price(ticker: str = "AAPL", days_ahead: int = 1):
    """
    Predict future stock prices using the trained model.
    
    Args:
        ticker (str): Stock ticker symbol
        days_ahead (int): Number of days to predict ahead
    """
    print("=" * 70)
    print(f"🔮 STOCK MARKET PREDICTOR - PREDICTION")
    print("=" * 70)
    print(f"📊 Ticker: {ticker}")
    print(f"📅 Predicting {days_ahead} day(s) ahead")
    print("=" * 70)
    
    # Load metadata
    metadata_path = f"models/{ticker}_metadata.json"
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Metadata not found. Please train the model first.")
    
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    sequence_length = metadata['sequence_length']
    num_features = metadata['num_features']
    
    print(f"\n📋 Model Info:")
    print(f"   Trained on: {metadata['trained_on']}")
    print(f"   Test MAE: {metadata['test_mae']:.6f}")
    print(f"   Sequence Length: {sequence_length}")
    
    # Load model and scaler
    print("\n[1/4] 🧠 Loading trained model...")
    model = load_trained_model(f"models/{ticker}_best_model.h5")
    
    print("\n[2/4] 📊 Loading scaler...")
    scaler = joblib.load(f"models/{ticker}_scaler.pkl")
    
    # Fetch recent data
    print("\n[3/4] 📥 Fetching recent data...")
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
    print(f"\n[4/4] 🔮 Making predictions...")
    predictions = []
    current_sequence = last_sequence.copy()
    
    for i in range(days_ahead):
        # Reshape for prediction
        X_pred = current_sequence.reshape(1, sequence_length, num_features)
        
        # Predict
        pred_scaled = model.predict(X_pred, verbose=0)
        predictions.append(pred_scaled[0, 0])
        
        # Update sequence for next prediction
        if i < days_ahead - 1:
            # Create new row with predicted value
            new_row = current_sequence[-1].copy()
            new_row[0] = pred_scaled[0, 0]  # Update Close price
            
            # Shift sequence and add new prediction
            current_sequence = np.vstack([current_sequence[1:], new_row])
    
    # Inverse transform predictions
    predictions = np.array(predictions)
    predictions_original = inverse_transform_predictions(predictions, scaler, num_features)
    
    # Get actual prices for comparison
    actual_prices = df['Close'].values[-30:]  # Last 30 days
    actual_dates = df['Date'].values[-30:]
    
    # Generate future dates
    last_date = pd.to_datetime(df['Date'].iloc[-1])
    future_dates = [last_date + timedelta(days=i+1) for i in range(days_ahead)]
    
    # Display predictions
    print("\n" + "=" * 70)
    print("📈 PREDICTIONS")
    print("=" * 70)
    current_price = df['Close'].iloc[-1]
    if isinstance(current_price, pd.Series):
        current_price = current_price.iloc[0]
    print(f"💰 Current Price: ${float(current_price):.2f}")
    print(f"\n🔮 Predicted Prices:")
    
    for i, (date, price) in enumerate(zip(future_dates, predictions_original)):
        change = ((price - current_price) / current_price) * 100
        arrow = "📈" if change > 0 else "📉"
        print(f"   {date.strftime('%Y-%m-%d')}: ${price:.2f} ({arrow} {change:+.2f}%)")
    
    # Plot predictions
    plot_predictions(actual_dates, actual_prices, future_dates, 
                    predictions_original, ticker)
    
    print("\n" + "=" * 70)
    print("✅ PREDICTION COMPLETE!")
    print("=" * 70)
    print(f"📁 Visualization saved: models/{ticker}_prediction.png")
    print("=" * 70)


def plot_predictions(actual_dates, actual_prices, future_dates, 
                     predictions, ticker: str):
    """
    Plot actual prices and predictions.
    
    Args:
        actual_dates: Dates for actual prices
        actual_prices: Actual historical prices
        future_dates: Dates for predictions
        predictions: Predicted prices
        ticker (str): Stock ticker symbol
    """
    plt.figure(figsize=(14, 6))
    
    # Plot actual prices
    plt.plot(actual_dates, actual_prices, label='Actual Prices', 
             linewidth=2, color='#2E86AB', marker='o', markersize=3)
    
    # Plot predictions
    plt.plot(future_dates, predictions, label='Predicted Prices', 
             linewidth=2, color='#A23B72', marker='s', markersize=6, 
             linestyle='--')
    
    # Styling
    plt.title(f'{ticker} Stock Price Prediction', fontsize=16, fontweight='bold')
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Price ($)', fontsize=12)
    plt.legend(fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # Save plot
    save_path = f"models/{ticker}_prediction.png"
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


if __name__ == "__main__":
    # Predict next 5 days for Apple stock
    predict_stock_price(ticker="AAPL", days_ahead=5)
